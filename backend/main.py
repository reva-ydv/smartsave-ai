from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uuid
from datetime import datetime, date
import calendar
import pandas as pd
from database.connection import engine
from database.models import User
from database.connection import Base
from routes.user import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(user_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---- In-memory storage ----
db = {
    "income": 0,
    "pots": [],
    "expenses": []
}

# ---- Request Schema ----
class IncomeRequest(BaseModel):
    income: int

class ExpenseRequest(BaseModel):
    amount: int
    category: str
    note: str | None = None
    date: str

# ---- Helper Function ----
def generate_budget(income: int):
    if income <= 0:
        raise HTTPException(status_code=400, detail="invalid_income")

    pots = [
        {"key": "savings", "label": "Savings", "allocated": int(0.4 * income), "spent": 0, "color": "var(--pot-savings)"},
        {"key": "food",    "label": "Food",    "allocated": int(0.2 * income), "spent": 0, "color": "var(--pot-food)"},
        {"key": "buffer",  "label": "Buffer",  "allocated": int(0.2 * income), "spent": 0, "color": "var(--pot-buffer)"},
        {"key": "travel",  "label": "Travel",  "allocated": int(0.1 * income), "spent": 0, "color": "var(--pot-travel)"},
        {"key": "misc",    "label": "Misc",    "allocated": int(0.1 * income), "spent": 0, "color": "var(--pot-misc)"},
    ]

    return {
        "income": income,
        "pots": pots,
        "explanation": f"Budget split based on your income of {income}"
    }


# ---- API Endpoint ----
@app.post("/generate-budget")
def generate_budget_api(data: IncomeRequest):
    result = generate_budget(data.income)

    db["income"] = result["income"]
    db["pots"] = result["pots"]

    return result
@app.get("/get-pot-status")
def get_pot_status():
    pots = db["pots"]
    income = db["income"]

    total_allocated = sum(p["allocated"] for p in pots)
    total_spent = sum(p["spent"] for p in pots)

    return {
        "income": income,
        "pots": pots,
        "totals": {
            "totalAllocated": total_allocated,
            "totalSpent": total_spent,
            "remaining": total_allocated - total_spent
        }
    }

@app.post("/add-expense", status_code=201)
def add_expense(data: ExpenseRequest):
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="invalid_amount")

    # find pot
    pot = next((p for p in db["pots"] if p["key"] == data.category), None)

    if not pot:
        raise HTTPException(status_code=400, detail="unknown_category")

    # create expense
    expense = {
        "id": str(uuid.uuid4()),
        "amount": data.amount,
        "category": data.category,
        "note": data.note,
        "date": data.date
    }

    # update state
    db["expenses"].append(expense)
    pot["spent"] += data.amount

    return {
        "expense": expense,
        "pot": pot
    }
@app.get("/get-savings-recommendation")
def get_savings_recommendation():
    today = date.today()

    # last day of current month
    last_day = calendar.monthrange(today.year, today.month)[1]
    days_left = last_day - today.day + 1

    pots = db["pots"]

    # flexible pots (exclude savings)
    flexible_remaining = 0
    savings_target = 0
    savings_saved = 0

    for p in pots:
        if p["key"] == "savings":
            savings_target = p["allocated"]
            savings_saved = p["spent"]
        else:
            remaining = max(0, p["allocated"] - p["spent"])
            flexible_remaining += remaining

    daily_safe = flexible_remaining // max(1, days_left)

    return {
        "daysLeft": days_left,
        "dailySafe": daily_safe,
        "flexibleRemaining": flexible_remaining,
        "savings": {
            "target": savings_target,
            "saved": savings_saved,
            "progress": 0 if savings_target == 0 else round(savings_saved / savings_target, 2)
        }
    }

@app.get("/monthly-summary")
def monthly_summary():
    pots = db["pots"]
    expenses = db["expenses"]
    income = db["income"]

    df = pd.DataFrame(expenses)

    # handle empty case
    if df.empty:
        category_actual = {p["key"]: 0 for p in pots}
    else:
        category_actual = df.groupby("category")["amount"].sum().to_dict()

    rows = []
    alerts = []

    for p in pots:
        planned = p["allocated"]
        actual = category_actual.get(p["key"], 0)
        variance = planned - actual

        ratio = actual / planned if planned > 0 else 0

        if ratio >= 1:
            status = "over"
        elif ratio >= 0.8:
            status = "warning"
        else:
            status = "on_track"

        rows.append({
            "key": p["key"],
            "label": p["label"],
            "planned": planned,
            "actual": actual,
            "variance": variance,
            "status": status
        })

        alerts.append({
            "key": p["key"],
            "label": p["label"],
            "pct": int(ratio * 100),
            "over": actual > planned
        })

    # top category
    if category_actual:
        top_key = max(category_actual, key=category_actual.get)
        top_category = {
            "key": top_key,
            "label": next(p["label"] for p in pots if p["key"] == top_key),
            "total": category_actual[top_key]
        }
    else:
        top_category = None

    weekly_spend = sum(category_actual.values())

    return {
        "month": "current",
        "income": income,
        "rows": rows,
        "alerts": alerts,
        "topCategory": top_category,
        "weeklySpend": weekly_spend
    }