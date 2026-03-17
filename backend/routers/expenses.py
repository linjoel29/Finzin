from fastapi import APIRouter, HTTPException
from models import ExpenseCreate
import database as db
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("/{user_id}")
def get_expenses(user_id: str):
    return {"expenses": db.get_user_expenses(user_id)}


@router.post("")
def add_expense(body: ExpenseCreate):
    if not db.users.get(body.user_id):
        raise HTTPException(status_code=404, detail="User not found")
    expense = {
        "id": str(uuid.uuid4()),
        "user_id": body.user_id,
        "amount": body.amount,
        "category": body.category,
        "description": body.description,
        "date": datetime.now().isoformat()
    }
    db.expenses.append(expense)
    return {"success": True, "expense": expense}


@router.delete("/{expense_id}")
def delete_expense(expense_id: str):
    for i, e in enumerate(db.expenses):
        if e["id"] == expense_id:
            db.expenses.pop(i)
            return {"success": True}
    raise HTTPException(status_code=404, detail="Expense not found")
