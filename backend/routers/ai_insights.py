from fastapi import APIRouter
from pydantic import BaseModel
import database as db
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")

router = APIRouter(prefix="/api/insights", tags=["AI Insights"])
ai_buddy_router = APIRouter(prefix="/api", tags=["AI Budget Buddy"])


# ─── Rule-based insights ────────────────────────────────────────────────────

@router.get("/{user_id}")
def get_insights(user_id: str):
    expenses = db.get_user_expenses(user_id)
    if not expenses:
        return {
            "insights": [{"type": "info", "message": "No expenses recorded yet. Start making payments to get personalized AI insights!", "icon": "💡"}],
            "category_totals": {},
            "total_spent": 0,
        }

    total = sum(e["amount"] for e in expenses)
    category_totals: dict[str, float] = {}
    for e in expenses:
        category_totals[e["category"]] = category_totals.get(e["category"], 0) + e["amount"]

    insights = []

    # Category percentage insights
    cat_icons = {"Food": "🍔", "Transport": "🚌", "Shopping": "🛍️", "Entertainment": "🎬", "Education": "📚", "Other": "📦"}
    for cat, amt in category_totals.items():
        pct = (amt / total) * 100
        if pct > 35:
            insights.append({
                "type": "warning",
                "message": f"You spent {pct:.0f}% of your budget on {cat} this month. Consider reducing it.",
                "icon": cat_icons.get(cat, "💰"),
            })

    # Budget prediction (₹5000 monthly)
    budget = 5000
    try:
        dates = [datetime.fromisoformat(e["date"]) for e in expenses]
        days_passed = max((datetime.now() - min(dates)).days, 1)
    except Exception:
        days_passed = 1
    daily_rate = total / days_passed
    days_remaining = (budget - total) / daily_rate if daily_rate > 0 else 999

    if total >= budget:
        insights.append({"type": "danger", "message": f"🚨 You've exceeded your ₹{budget} monthly budget by ₹{total - budget:.0f}!", "icon": "🔴"})
    elif total / budget >= 0.70:
        insights.append({"type": "danger", "message": f"⚠️ You have used {(total/budget*100):.0f}% of your monthly budget.", "icon": "⏳"})
    elif 0 < days_remaining < 15:
        insights.append({"type": "danger", "message": f"⏳ At your current rate, budget may run out in {days_remaining:.0f} days!", "icon": "⏳"})
    else:
        insights.append({"type": "success", "message": "✅ Great job! You're on track to finish the month within your budget.", "icon": "🎯"})

    if total > 1500:
        insights.append({"type": "tip", "message": "💸 You've spent over ₹1500. Try moving ₹200 to your savings pocket this week.", "icon": "🐷"})

    if category_totals:
        top_cat = max(category_totals, key=category_totals.get)
        insights.append({"type": "info", "message": f"📊 Your highest spending category is {top_cat} (₹{category_totals[top_cat]:.0f}).", "icon": "📈"})

    insights.append({"type": "sdg", "message": "🌱 SDG Tip: Shopping locally and avoiding impulse buying supports SDG-12 (Responsible Consumption).", "icon": "🌍"})

    return {"insights": insights, "total_spent": total, "category_totals": category_totals}


# ─── Mistral AI Budget Insight Endpoint ─────────────────────────────────────

class BudgetInsightRequest(BaseModel):
    monthly_budget: float
    spent_this_week: float
    remaining_balance: float
    top_category: str
    user_name: str = "Student"
    custom_question: str = ""   # optional free-text question from user


@ai_buddy_router.post("/ai-budget-insight")
async def ai_budget_insight(req: BudgetInsightRequest):
    """
    Calls Mistral AI to generate personalised financial advice for the student.
    Also returns smart notification flags based on spending thresholds.
    """

    # ── Smart notification flags ──────────────────────────────────────────────
    budget_used_pct = ((req.monthly_budget - req.remaining_balance) / req.monthly_budget) * 100 if req.monthly_budget else 0
    notifications = []
    if budget_used_pct >= 70:
        notifications.append({"type": "warning", "message": f"⚠️ You have used {budget_used_pct:.0f}% of your monthly budget."})
    if req.remaining_balance < 500:
        notifications.append({"type": "danger", "message": f"🔴 Low balance! Only ₹{req.remaining_balance:.0f} remaining this month."})
    # High category spend: if week spend > 40% of monthly budget
    weekly_pct = (req.spent_this_week / req.monthly_budget) * 100 if req.monthly_budget else 0
    if weekly_pct >= 40:
        notifications.append({"type": "warning", "message": f"📊 You've spent {weekly_pct:.0f}% of your monthly budget in just one week (mostly on {req.top_category})."})

    # ── Build Mistral prompt ─────────────────────────────────────────────────
    if req.custom_question:
        user_message = (
            f"A student named {req.user_name} has a monthly budget of ₹{req.monthly_budget:.0f}. "
            f"They spent ₹{req.spent_this_week:.0f} this week, mostly on {req.top_category}. "
            f"Remaining balance: ₹{req.remaining_balance:.0f}. "
            f"Their question: {req.custom_question}"
        )
    else:
        user_message = (
            f"A student named {req.user_name} has a monthly budget of ₹{req.monthly_budget:.0f} and spent "
            f"₹{req.spent_this_week:.0f} this week mostly on {req.top_category}. "
            f"Remaining balance is ₹{req.remaining_balance:.0f}. "
            f"Give a short, friendly, personalised budgeting suggestion in 2-3 sentences. "
            f"Address the student by name. Use a warm, encouraging tone with 1-2 emojis."
        )

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "mistral-small",
        "messages": [
            {
                "role": "system",
                "content": "You are a smart financial assistant helping students manage their monthly budget. Give friendly, short advice in 2-3 sentences max.",
            },
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 150,
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            advice = data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as e:
        advice = f"Hey {req.user_name} 👋 You've spent ₹{req.spent_this_week:.0f} this week. Stay mindful of your spending and try to save a little each day!"
    except Exception:
        advice = f"Hey {req.user_name} 👋 You've spent ₹{req.spent_this_week:.0f} this week mostly on {req.top_category}. Try to track each expense carefully to stay within your ₹{req.monthly_budget:.0f} budget!"

    return {
        "advice": advice,
        "notifications": notifications,
        "budget_used_pct": round(budget_used_pct, 1),
    }
