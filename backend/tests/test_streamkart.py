"""StreamKart backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://content-vault-255.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Catalog endpoints
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("message") == "StreamKart API"


def test_list_products(session):
    r = session.get(f"{API}/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 34, f"Expected 34 products, got {len(data)}"
    assert all("id" in p and "title" in p and "price" in p for p in data)
    # All prices should be INR base (numeric, e.g., 1199)
    assert all(isinstance(p["price"], (int, float)) and p["price"] > 100 for p in data)


@pytest.mark.parametrize("cat,expected", [("book", 24), ("audiobook", 10)])
def test_filter_category(session, cat, expected):
    r = session.get(f"{API}/products", params={"category": cat})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == expected, f"Expected {expected} {cat}, got {len(data)}"
    assert all(p["category"] == cat for p in data)


def test_filter_category_news_empty(session):
    r = session.get(f"{API}/products", params={"category": "news"})
    assert r.status_code == 200
    assert r.json() == []


def test_search(session):
    r = session.get(f"{API}/products", params={"search": "Murakami"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert any("Murakami" in p["author"] for p in data)


def test_featured_filter(session):
    r = session.get(f"{API}/products", params={"featured": "true"})
    assert r.status_code == 200
    assert all(p["featured"] for p in r.json())


def test_get_product_by_id(session):
    r = session.get(f"{API}/products/p-001")
    assert r.status_code == 200
    p = r.json()
    assert p["id"] == "p-001"
    assert p["title"] == "Norwegian Wood"


def test_get_product_404(session):
    r = session.get(f"{API}/products/does-not-exist")
    assert r.status_code == 404


def test_categories(session):
    r = session.get(f"{API}/categories")
    assert r.status_code == 200
    data = r.json()
    slugs = {c["slug"] for c in data}
    assert slugs == {"all", "book", "audiobook"}, f"Unexpected categories: {slugs}"
    assert "news" not in slugs


def test_get_product_inr_price(session):
    r = session.get(f"{API}/products/p-001")
    assert r.status_code == 200
    p = r.json()
    # INR base — Norwegian Wood is 1199
    assert p["price"] == 1199


def test_authors(session):
    r = session.get(f"{API}/authors")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 5
    assert all("name" in a for a in data)


# Order flow
@pytest.fixture
def order_payload():
    return {
        "items": [
            {"product_id": "p-001", "title": "Norwegian Wood", "author": "Haruki Murakami",
             "price": 1199, "quantity": 2, "cover_image": "x"},
            {"product_id": "p-008", "title": "Sapiens", "author": "Yuval Noah Harari",
             "price": 1599, "quantity": 1, "cover_image": "x"},
        ],
        "customer_name": "TEST_User",
        "customer_email": "test_user@example.com",
        "customer_phone": "+919999999999",
        "payment_method": "razorpay",
    }


def test_create_order_razorpay(session, order_payload):
    r = session.post(f"{API}/orders", json=order_payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "order_id" in data
    expected_total = round(1199 * 2 + 1599, 2)
    assert data["total_amount"] == expected_total
    assert data["status"] == "pending"
    ps = data["payment_session"]
    assert ps["provider"] == "razorpay"
    assert ps["session_id"].startswith("rzp_mock_")
    assert ps["amount_paise"] == int(expected_total * 100)
    assert ps["currency"] == "INR"


def test_create_order_cashfree(session, order_payload):
    payload = {**order_payload, "payment_method": "cashfree"}
    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200
    ps = r.json()["payment_session"]
    assert ps["provider"] == "cashfree"
    assert ps["session_id"].startswith("cf_mock_")


def test_empty_cart_rejected(session, order_payload):
    payload = {**order_payload, "items": []}
    r = session.post(f"{API}/orders", json=payload)
    assert r.status_code == 400


def test_full_payment_flow(session, order_payload):
    # Create
    r = session.post(f"{API}/orders", json=order_payload)
    assert r.status_code == 200
    order_id = r.json()["order_id"]

    # Verify (mock)
    r = session.post(f"{API}/orders/verify", json={
        "order_id": order_id, "payment_id": "pay_mock_123abc", "payment_method": "razorpay"
    })
    assert r.status_code == 200
    assert r.json()["status"] == "paid"
    assert r.json()["payment_id"] == "pay_mock_123abc"

    # GET to confirm persisted
    r = session.get(f"{API}/orders/{order_id}")
    assert r.status_code == 200
    o = r.json()
    assert o["status"] == "paid"
    assert o["payment_id"] == "pay_mock_123abc"
    assert o["customer_name"] == "TEST_User"


def test_verify_unknown_order(session):
    r = session.post(f"{API}/orders/verify", json={
        "order_id": "nope", "payment_id": "x", "payment_method": "razorpay"
    })
    assert r.status_code == 404


def test_get_order_404(session):
    r = session.get(f"{API}/orders/no-such-order")
    assert r.status_code == 404
