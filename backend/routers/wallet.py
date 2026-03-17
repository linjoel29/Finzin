from fastapi import APIRouter, HTTPException
from models import AddMoneyRequest, PayPhoneRequest, ScanPayRequest, SavingsRequest
import database as db

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])


@router.get("/{user_id}")
def get_wallet(user_id: str):
    user = db.users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"wallet": user["wallet"], "savings": user["savings"]}


@router.post("/add-money")
def add_money(body: AddMoneyRequest):
    user = db.users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    user["wallet"] += body.amount
    txn = db.add_transaction(body.user_id, "credit", body.amount, f"Added ₹{body.amount:.0f} to wallet")
    return {"success": True, "wallet": user["wallet"], "transaction": txn}


@router.post("/pay-phone")
def pay_phone(body: PayPhoneRequest):
    sender = db.users.get(body.sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    receiver = db.get_user_by_phone(body.phone)
    if not receiver:
        raise HTTPException(status_code=404, detail="No user found with that phone number")
    if sender["wallet"] < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    sender["wallet"] -= body.amount
    receiver["wallet"] += body.amount
    description = f"Paid ₹{body.amount:.0f} to {receiver['name']}"
    db.add_transaction(body.sender_id, "debit", body.amount, description)
    db.add_transaction(receiver["id"], "credit", body.amount, f"Received ₹{body.amount:.0f} from {sender['name']}")
    db.auto_add_expense(body.sender_id, body.amount, description)
    return {"success": True, "wallet": sender["wallet"], "receiver": receiver["name"]}


@router.post("/scan-pay")
def scan_pay(body: ScanPayRequest):
    sender = db.users.get(body.sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    if sender["wallet"] < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    sender["wallet"] -= body.amount
    note = body.note or "QR Payment"
    description = f"{note} – ₹{body.amount:.0f} to {body.receiver_id}"
    txn = db.add_transaction(body.sender_id, "debit", body.amount, description)
    db.auto_add_expense(body.sender_id, body.amount, description)
    return {"success": True, "wallet": sender["wallet"], "transaction": txn}


@router.post("/move-to-savings")
def move_to_savings(body: SavingsRequest):
    user = db.users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["wallet"] < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    user["wallet"] -= body.amount
    user["savings"] += body.amount
    db.add_transaction(body.user_id, "debit", body.amount, f"Moved ₹{body.amount:.0f} to Savings")
    return {"success": True, "wallet": user["wallet"], "savings": user["savings"]}


@router.post("/withdraw-savings")
def withdraw_savings(body: SavingsRequest):
    user = db.users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["savings"] < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient savings")
    user["savings"] -= body.amount
    user["wallet"] += body.amount
    db.add_transaction(body.user_id, "credit", body.amount, f"Withdrawn ₹{body.amount:.0f} from Savings")
    return {"success": True, "wallet": user["wallet"], "savings": user["savings"]}


@router.get("/transactions/{user_id}")
def get_transactions(user_id: str):
    return {"transactions": db.get_user_transactions(user_id)}
