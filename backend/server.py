from fastapi import FastAPI, APIRouter, HTTPException, Query, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio
import requests

from seed_data import SEED_PRODUCTS, SEED_CATEGORIES, SEED_AUTHORS
from reader_content import reader_payload

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="StreamKart API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    author: str
    category: str  # book | audiobook | news
    genre: str
    price: float
    original_price: Optional[float] = None
    rating: float = 4.5
    reviews: int = 0
    cover_image: str
    description: str
    pages: Optional[int] = None
    duration: Optional[str] = None
    language: str = "English"
    publisher: Optional[str] = None
    year: Optional[int] = None
    featured: bool = False
    bestseller: bool = False


class OrderItem(BaseModel):
    product_id: str
    title: str
    author: str
    price: float
    quantity: int
    cover_image: str


class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    payment_method: str  # razorpay | cashfree


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[OrderItem]
    customer_name: str
    customer_email: str
    customer_phone: str
    payment_method: str
    total_amount: float
    status: str = "pending"
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentVerify(BaseModel):
    order_id: str
    payment_id: str
    payment_method: str


# ---------- Seed on startup ----------
async def seed_database():
    count = await db.products.count_documents({})
    if count == 0:
        await db.products.insert_many([dict(p) for p in SEED_PRODUCTS])
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "StreamKart API", "version": "1.0"}


@api_router.get("/geo")
async def geo(request: Request):
    """Returns the visitor's country_code (best-effort) for currency auto-detection."""
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "")
    country = None
    try:
        if ip and not ip.startswith(("10.", "127.", "192.168.", "172.")):
            r = requests.get(f"https://ipapi.co/{ip}/json/", timeout=2.5)
            if r.ok:
                data = r.json()
                country = data.get("country_code")
    except Exception:
        country = None
    return {"country_code": country}


@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    author: Optional[str] = None,
    genre: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    bestseller: Optional[bool] = None,
    limit: int = 100,
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if author:
        query["author"] = author
    if genre:
        query["genre"] = genre
    if featured is not None:
        query["featured"] = featured
    if bestseller is not None:
        query["bestseller"] = bestseller
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
            {"genre": {"$regex": search, "$options": "i"}},
        ]
    items = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@api_router.get("/categories")
async def list_categories():
    return SEED_CATEGORIES


@api_router.get("/authors")
async def list_authors():
    return SEED_AUTHORS


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    total = sum(item.price * item.quantity for item in payload.items)
    order = Order(
        items=payload.items,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        payment_method=payload.payment_method,
        total_amount=round(total, 2),
    )
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)

    # MOCK payment session creation
    if payload.payment_method == "razorpay":
        payment_session = {
            "provider": "razorpay",
            "session_id": f"rzp_mock_{uuid.uuid4().hex[:12]}",
            "key_id": "rzp_test_mock_key",
            "amount_paise": int(total * 100),
            "currency": "INR",
        }
    else:  # cashfree
        payment_session = {
            "provider": "cashfree",
            "session_id": f"cf_mock_{uuid.uuid4().hex[:12]}",
            "amount": total,
            "currency": "INR",
        }

    return {
        "order_id": order.id,
        "total_amount": order.total_amount,
        "status": order.status,
        "payment_session": payment_session,
    }


@api_router.post("/orders/verify")
async def verify_payment(payload: PaymentVerify):
    order = await db.orders.find_one({"id": payload.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # MOCK verification — accept any non-empty payment_id
    await db.orders.update_one(
        {"id": payload.order_id},
        {"$set": {"status": "paid", "payment_id": payload.payment_id}},
    )
    order["status"] = "paid"
    order["payment_id"] = payload.payment_id
    return order


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@api_router.get("/read/{order_id}/{product_id}")
async def read_title(order_id: str, product_id: str):
    """Grant the reader/player payload for a purchased title.
    Validates the order is paid and contains the product."""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.get("status") != "paid":
        raise HTTPException(status_code=403, detail="Title is locked — payment not completed")
    item = next((i for i in order["items"] if i["product_id"] == product_id), None)
    if not item:
        raise HTTPException(status_code=403, detail="This title is not part of your order")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Title no longer available")
    return {
        "product": product,
        "order_id": order_id,
        "reader": reader_payload(product),
    }


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    await seed_database()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
