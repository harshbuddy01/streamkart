"""Auth + Tickets + Reader endpoint tests for StreamKart (iteration 4)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@streamkart.com"
ADMIN_PASS = "StreamAdmin@2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def random_user(s):
    """Register a fresh test user for the module."""
    email = f"qauser_{uuid.uuid4().hex[:8]}@test.com"
    pwd = "pass1234"
    r = s.post(f"{API}/auth/register", json={"name": "QA User", "email": email, "password": pwd})
    assert r.status_code == 200, r.text
    data = r.json()
    return {"email": email, "password": pwd, "token": data["token"], "user": data["user"]}


@pytest.fixture
def auth_headers(random_user):
    return {"Authorization": f"Bearer {random_user['token']}"}


# ---------- AUTH ----------
class TestAuth:
    def test_register_returns_user_and_token(self, random_user):
        assert random_user["token"]
        assert random_user["user"]["email"] == random_user["email"].lower()
        assert random_user["user"]["role"] == "user"
        assert "id" in random_user["user"]

    def test_register_duplicate_email_400(self, s, random_user):
        r = s.post(f"{API}/auth/register", json={
            "name": "Dup", "email": random_user["email"], "password": "pass1234"
        })
        assert r.status_code == 400

    def test_login_correct(self, s, random_user):
        r = s.post(f"{API}/auth/login", json={
            "email": random_user["email"], "password": random_user["password"]
        })
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["email"] == random_user["email"].lower()
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password_401(self, s, random_user):
        r = s.post(f"{API}/auth/login", json={
            "email": random_user["email"], "password": "WRONGPASS"
        })
        assert r.status_code == 401

    def test_me_with_token(self, s, random_user, auth_headers):
        r = s.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == random_user["email"].lower()
        assert u["role"] == "user"

    def test_me_without_token_401(self, s):
        # Use bare requests (don't carry session-level Authorization if any)
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_admin_login(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["user"]["email"] == ADMIN_EMAIL


# ---------- TICKETS ----------
class TestTickets:
    def test_create_requires_auth(self, s):
        r = requests.post(f"{API}/tickets", json={
            "subject": "Help me", "category": "order", "message": "I need help with my order please."
        })
        assert r.status_code == 401

    def test_invalid_category_400(self, s, auth_headers):
        r = s.post(f"{API}/tickets", json={
            "subject": "Bad cat", "category": "INVALID_CAT", "message": "This is a test message."
        }, headers=auth_headers)
        assert r.status_code == 400

    def test_create_ticket_with_auto_response(self, s, auth_headers, random_user):
        r = s.post(f"{API}/tickets", json={
            "subject": "Order issue", "category": "order",
            "message": "My order p-001 has not been delivered yet."
        }, headers=auth_headers)
        assert r.status_code == 200, r.text
        t = r.json()
        assert t["subject"] == "Order issue"
        assert t["category"] == "order"
        assert t["status"] == "open"
        assert len(t["messages"]) == 2
        assert t["messages"][0]["author"] == "user"
        assert t["messages"][1]["author"] == "support"
        assert "received" in t["messages"][1]["body"].lower() or "support" in t["messages"][1]["body"].lower()
        # store on class for reuse
        TestTickets._ticket_id = t["id"]

    def test_list_returns_only_own(self, s, auth_headers, random_user):
        r = s.get(f"{API}/tickets", headers=auth_headers)
        assert r.status_code == 200
        tickets = r.json()
        assert isinstance(tickets, list)
        assert len(tickets) >= 1
        # All tickets belong to current user
        for t in tickets:
            assert t["user_id"] == random_user["user"]["id"]

    def test_get_owned_ticket(self, s, auth_headers):
        tid = TestTickets._ticket_id
        r = s.get(f"{API}/tickets/{tid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["id"] == tid

    def test_get_other_user_ticket_403(self, s):
        # Register a 2nd user, create ticket as that user, then try fetching with first user
        email2 = f"qauser2_{uuid.uuid4().hex[:8]}@test.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "QA Two", "email": email2, "password": "pass1234"
        })
        assert r.status_code == 200
        t2 = r.json()["token"]
        h2 = {"Authorization": f"Bearer {t2}"}

        r = requests.post(f"{API}/tickets", json={
            "subject": "Other user ticket", "category": "account",
            "message": "Account question from another user."
        }, headers=h2)
        assert r.status_code == 200
        other_tid = r.json()["id"]

        # Now use TestTickets._ticket_id owner's token to fetch other_tid -> 403
        r = s.get(f"{API}/tickets/{other_tid}", headers={"Authorization": f"Bearer {pytest._first_user_token}"})
        assert r.status_code == 403

    def test_post_message_updates_status(self, s, auth_headers):
        tid = TestTickets._ticket_id
        r = s.post(f"{API}/tickets/{tid}/messages",
                   json={"body": "Any updates yet?"}, headers=auth_headers)
        assert r.status_code == 200
        t = r.json()
        assert t["status"] == "awaiting_support"
        assert any(m["body"] == "Any updates yet?" for m in t["messages"])


# Tiny shim so test_get_other_user_ticket_403 has access to the first-user token.
@pytest.fixture(autouse=True)
def _stash_token(random_user):
    pytest._first_user_token = random_user["token"]
    yield


# ---------- READER ----------
class TestReader:
    @pytest.fixture(scope="class")
    def paid_order(self):
        # Create order
        payload = {
            "items": [
                {"product_id": "p-001", "title": "Norwegian Wood", "author": "Haruki Murakami",
                 "price": 1199, "quantity": 1, "cover_image": "x"},
            ],
            "customer_name": "TEST_Reader",
            "customer_email": "reader@test.com",
            "customer_phone": "+919999999999",
            "payment_method": "razorpay",
        }
        r = requests.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        order_id = r.json()["order_id"]
        yield {"order_id": order_id, "paid": False, "payload": payload}

    def test_unknown_order_404(self):
        r = requests.get(f"{API}/read/no-such-order/p-001")
        assert r.status_code == 404

    def test_unpaid_order_403(self, paid_order):
        r = requests.get(f"{API}/read/{paid_order['order_id']}/p-001")
        assert r.status_code == 403

    def test_paid_book_returns_chapters(self, paid_order):
        # Pay the order
        r = requests.post(f"{API}/orders/verify", json={
            "order_id": paid_order["order_id"], "payment_id": "pay_mock_xyz", "payment_method": "razorpay"
        })
        assert r.status_code == 200
        paid_order["paid"] = True

        r = requests.get(f"{API}/read/{paid_order['order_id']}/p-001")
        assert r.status_code == 200
        d = r.json()
        assert d["product"]["id"] == "p-001"
        assert d["reader"]["kind"] == "book"
        assert isinstance(d["reader"]["chapters"], list) and len(d["reader"]["chapters"]) >= 1
        assert "title" in d["reader"]["chapters"][0]
        assert "paragraphs" in d["reader"]["chapters"][0]

    def test_product_not_in_order_403(self, paid_order):
        if not paid_order["paid"]:
            pytest.skip("requires paid order")
        # Use a product NOT in the order — pick a known existing audiobook id
        r = requests.get(f"{API}/products", params={"category": "audiobook"})
        assert r.status_code == 200
        ab = r.json()[0]
        r = requests.get(f"{API}/read/{paid_order['order_id']}/{ab['id']}")
        assert r.status_code == 403

    def test_audiobook_returns_tracks(self):
        # Create + pay an audiobook order then call reader
        r = requests.get(f"{API}/products", params={"category": "audiobook"})
        ab = r.json()[0]
        payload = {
            "items": [{
                "product_id": ab["id"], "title": ab["title"], "author": ab["author"],
                "price": ab["price"], "quantity": 1, "cover_image": ab["cover_image"]
            }],
            "customer_name": "TEST_Audio", "customer_email": "audio@test.com",
            "customer_phone": "+919999999999", "payment_method": "razorpay",
        }
        r = requests.post(f"{API}/orders", json=payload)
        oid = r.json()["order_id"]
        requests.post(f"{API}/orders/verify", json={
            "order_id": oid, "payment_id": "pay_mock_a1", "payment_method": "razorpay"
        })
        r = requests.get(f"{API}/read/{oid}/{ab['id']}")
        assert r.status_code == 200
        d = r.json()
        assert d["reader"]["kind"] == "audiobook"
        assert isinstance(d["reader"]["tracks"], list) and len(d["reader"]["tracks"]) >= 1
        assert "url" in d["reader"]["tracks"][0]
        assert d["reader"]["tracks"][0]["url"].startswith("http")
