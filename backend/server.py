from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Depends
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
from auth import (
    hash_password, verify_password, create_access_token,
    make_current_user_dep,
    RegisterIn, LoginIn, UserOut, AuthOut,
    TicketCreate, TicketMessage, TicketOut,
)

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


async def seed_admin():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@streamkart.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        doc = {
            "id": str(uuid.uuid4()),
            "name": "StreamKart Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user: {admin_email}")
    else:
        if not verify_password(admin_password, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )
            logger.info("Updated admin password from env")


# ---------- Auth dependency ----------
get_current_user = make_current_user_dep(lambda: db)


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


# ---------- Auth ----------
def _user_to_out(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "role": u.get("role", "user"),
        "created_at": u.get("created_at", datetime.now(timezone.utc).isoformat()),
    }


@api_router.post("/auth/register", response_model=AuthOut)
async def auth_register(payload: RegisterIn):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email)
    return {"user": _user_to_out(user_doc), "token": token}


@api_router.post("/auth/login", response_model=AuthOut)
async def auth_login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email)
    return {"user": _user_to_out(user), "token": token}


@api_router.get("/auth/me", response_model=UserOut)
async def auth_me(user=Depends(get_current_user)):
    return _user_to_out(user)


# ---------- Support tickets ----------
TICKET_CATEGORIES = {"order", "payment", "reader", "account", "other"}
INITIAL_RESPONSE = (
    "Thanks for reaching out — your ticket has been received by the StreamKart support desk. "
    "A human teammate will respond within one business day. In the meantime, please check "
    "your order confirmation email for the title access link."
)


@api_router.post("/tickets", response_model=TicketOut)
async def create_ticket(payload: TicketCreate, user=Depends(get_current_user)):
    cat = payload.category.lower()
    if cat not in TICKET_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose one of: {', '.join(sorted(TICKET_CATEGORIES))}")
    now = datetime.now(timezone.utc).isoformat()
    ticket = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "subject": payload.subject.strip(),
        "category": cat,
        "order_id": payload.order_id,
        "status": "open",
        "messages": [
            {"author": "user", "name": user["name"], "body": payload.message.strip(), "at": now},
            {"author": "support", "name": "StreamKart Support", "body": INITIAL_RESPONSE, "at": now},
        ],
        "created_at": now,
        "updated_at": now,
    }
    await db.tickets.insert_one(ticket)
    return ticket


@api_router.get("/tickets", response_model=list[TicketOut])
async def list_tickets(user=Depends(get_current_user)):
    cursor = db.tickets.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1)
    return await cursor.to_list(200)


@api_router.get("/tickets/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: str, user=Depends(get_current_user)):
    t = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if t["user_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your ticket")
    return t


@api_router.post("/tickets/{ticket_id}/messages", response_model=TicketOut)
async def add_ticket_message(ticket_id: str, payload: TicketMessage, user=Depends(get_current_user)):
    t = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if t["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your ticket")
    if t.get("status") == "closed":
        raise HTTPException(status_code=400, detail="This ticket is closed. Please open a new one.")
    now = datetime.now(timezone.utc).isoformat()
    msg = {"author": "user", "name": user["name"], "body": payload.body.strip(), "at": now}
    await db.tickets.update_one(
        {"id": ticket_id},
        {"$push": {"messages": msg}, "$set": {"updated_at": now, "status": "awaiting_support"}},
    )
    t["messages"].append(msg)
    t["updated_at"] = now
    t["status"] = "awaiting_support"
    return t


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
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
