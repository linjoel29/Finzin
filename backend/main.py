from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, wallet, expenses, ai_insights, offers, opportunities

app = FastAPI(
    title="Student Budget AI API",
    description="Backend API for the Student Budget AI financial super-app",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(expenses.router)
app.include_router(ai_insights.router)
app.include_router(ai_insights.ai_buddy_router)
app.include_router(offers.router)
app.include_router(opportunities.router)


@app.get("/")
def root():
    return {"message": "Student Budget AI API is running 🎓💰"}
