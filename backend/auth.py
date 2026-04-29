"""JWT auth + tickets module for StreamKart."""
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Request, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field, ConfigDict


JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_DAYS = 7  # SPA-friendly long session, stored in localStorage


def _secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------- Password hashing ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# ---------- Tokens ----------
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired — please sign in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Pydantic models ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str = "user"
    created_at: str


class AuthOut(BaseModel):
    user: UserOut
    token: str


class TicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=140)
    category: str  # order | payment | reader | account | other
    order_id: Optional[str] = None
    message: str = Field(min_length=10, max_length=4000)


class TicketMessage(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class TicketOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_email: str
    subject: str
    category: str
    order_id: Optional[str] = None
    status: str
    messages: list
    created_at: str
    updated_at: str


# ---------- get_current_user dependency factory ----------
def make_current_user_dep(get_db):
    async def _dep(request: Request) -> dict:
        token = None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
        if not token:
            token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        db = get_db()
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    return _dep
