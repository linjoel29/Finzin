from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str


class UserLogin(BaseModel):
    email: str
    password: str


class AddMoneyRequest(BaseModel):
    user_id: str
    amount: float


class PayPhoneRequest(BaseModel):
    sender_id: str
    phone: str
    amount: float


class ScanPayRequest(BaseModel):
    sender_id: str
    receiver_id: str
    amount: float
    note: Optional[str] = "QR Payment"


class SavingsRequest(BaseModel):
    user_id: str
    amount: float


class ExpenseCreate(BaseModel):
    user_id: str
    amount: float
    category: Literal["Food", "Transport", "Shopping", "Entertainment", "Education", "Other"]
    description: Optional[str] = ""
