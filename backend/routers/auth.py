from fastapi import APIRouter, HTTPException
from models import UserRegister, UserLogin
import database as db

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register")
def register(body: UserRegister):
    if db.get_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = db.create_user(body.name, body.email, body.password, body.phone)
    return {"success": True, "user": {k: v for k, v in user.items() if k != "password"}}


@router.post("/login")
def login(body: UserLogin):
    user = db.get_user_by_email(body.email)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"success": True, "user": {k: v for k, v in user.items() if k != "password"}}
