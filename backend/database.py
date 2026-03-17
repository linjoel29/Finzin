import uuid
from datetime import datetime

# ─── In-memory data store ────────────────────────────────────────────────────
users = {}          # user_id -> user dict
transactions = []   # list of transaction dicts
expenses = []       # list of expense dicts

# ─── Seed users ──────────────────────────────────────────────────────────────
def _seed():
    demo1 = {
        "id": "user_demo1",
        "name": "Arjun Sharma",
        "email": "arjun@student.edu",
        "password": "demo123",
        "phone": "9876543210",
        "wallet": 2000.0,
        "savings": 800.0,
    }
    demo2 = {
        "id": "user_demo2",
        "name": "Priya Nair",
        "email": "priya@student.edu",
        "password": "demo123",
        "phone": "9123456789",
        "wallet": 1500.0,
        "savings": 500.0,
    }
    users[demo1["id"]] = demo1
    users[demo2["id"]] = demo2

    # Seed transactions
    transactions.extend([
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "type": "debit", "amount": 120, "description": "Paid to Ravi", "date": "2026-03-10T10:00:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "type": "debit", "amount": 80, "description": "Paid to Campus Cafe", "date": "2026-03-11T12:30:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "type": "credit", "amount": 300, "description": "Received from Rahul", "date": "2026-03-12T09:15:00"},
    ])

    # Seed expenses
    expenses.extend([
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "amount": 450, "category": "Food", "description": "Weekly groceries", "date": "2026-03-01T00:00:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "amount": 200, "category": "Transport", "description": "Bus pass", "date": "2026-03-03T00:00:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "amount": 300, "category": "Shopping", "description": "Stationery", "date": "2026-03-05T00:00:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "amount": 150, "category": "Entertainment", "description": "Movie night", "date": "2026-03-07T00:00:00"},
        {"id": str(uuid.uuid4()), "user_id": "user_demo1", "amount": 500, "category": "Education", "description": "Online course", "date": "2026-03-09T00:00:00"},
    ])

_seed()


# ─── Offers (static seed) ─────────────────────────────────────────────────────
offers = [
    {
        "id": "o1", 
        "title": "Apple Student Discount", 
        "description": "Save up to ₹10,000 on Mac or iPad with education pricing.", 
        "discount": 10, 
        "platform": "Apple Education Store", 
        "expiry": "2026-12-31", 
        "link": "https://www.apple.com/in-edu/store", 
        "emoji": "💻",
        "tag": "🔥 Trending",
        "color": "#000"
    },
    {
        "id": "o2", 
        "title": "Spotify Premium Student", 
        "description": "50% off Premium for Students. Cancel anytime.", 
        "discount": 50, 
        "platform": "Spotify", 
        "expiry": "2026-06-30", 
        "link": "https://www.spotify.com/student", 
        "emoji": "🎵",
        "tag": "🎧 Must Have",
        "color": "#1DB954"
    },
    {
        "id": "o3", 
        "title": "Adobe Creative Cloud", 
        "description": "Save over 60% on 20+ creative apps for students.", 
        "discount": 60, 
        "platform": "Adobe", 
        "expiry": "Ongoing", 
        "link": "https://www.adobe.com/creativecloud/buy/students.html", 
        "emoji": "🎨",
        "tag": "🖌️ Creative",
        "color": "#FF0000"
    },
    {
        "id": "o4", 
        "title": "Amazon Prime Student", 
        "description": "50% off Prime Membership for 1 year.", 
        "discount": 50, 
        "platform": "Amazon", 
        "expiry": "2026-08-15", 
        "link": "https://www.amazon.in/joinstudent", 
        "emoji": "📦",
        "tag": "🚚 Fast Delivery",
        "color": "#FF9900"
    },
    {
        "id": "o5", 
        "title": "YouTube Premium Student", 
        "description": "Ad-free YouTube and Music at a student-friendly price.", 
        "discount": 40, 
        "platform": "YouTube", 
        "expiry": "Ongoing", 
        "link": "https://www.youtube.com/premium/student", 
        "emoji": "📺",
        "tag": "🎬 Ad-Free",
        "color": "#FF0000"
    },
    {
        "id": "o6", 
        "title": "Samsung Student Perks", 
        "description": "Additional 10% off on Galaxy smartphones and tablets.", 
        "discount": 10, 
        "platform": "Samsung Shop", 
        "expiry": "2026-12-25", 
        "link": "https://www.samsung.com/in/microsite/student-advantage/", 
        "emoji": "📱",
        "tag": "📱 Tech Deals",
        "color": "#1428a0"
    },
]

# ─── Scholarships (static seed) ───────────────────────────────────────────────
scholarships = [
    {"id": "s1", "name": "HDFC Badhte Kadam Scholarship", "eligibility": "Class 9-12 / UG Students", "deadline": "2026-03-31", "amount": "₹1,00,000", "link": "https://www.buddy4study.com/page/hdfc-bank-parivartan-ecss-scholarship"},
    {"id": "s2", "name": "Reliance Foundation Undergraduate", "eligibility": "1st Year UG Students", "deadline": "2026-04-15", "amount": "₹2,00,000", "link": "https://www.reliancefoundation.org/scholarships"},
    {"id": "s3", "name": "Google Generation Scholarship", "eligibility": "CS / Tech Students", "deadline": "2026-05-31", "amount": "₹2,50,000", "link": "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac"},
    {"id": "s4", "name": "Adobe Women in Technology", "eligibility": "Female CS Students", "deadline": "2026-06-15", "amount": "₹3,00,000", "link": "https://www.adobe.com/in/creativecloud/buy/students/scholarships.html"},
]

# ─── Jobs (static seed) ───────────────────────────────────────────────────────
jobs = [
    {"id": "j1", "title": "UX Design Intern", "location": "Zomato", "pay": "₹25,000/month", "type": "Remote", "link": "https://www.zomato.com/careers"},
    {"id": "j2", "title": "Software Engineer Intern", "location": "Swiggy", "pay": "₹40,000/month", "type": "Hybrid", "link": "https://www.swiggy.com/careers"},
    {"id": "j3", "title": "Frontend Developer (Part-time)", "location": "Finzin AI", "pay": "₹15,000/month", "type": "Remote", "link": "https://internshala.com"},
    {"id": "j4", "title": "Content Writer", "location": "EduTech", "pay": "₹10,000/month", "type": "Remote", "link": "https://internshala.com"},
]


def get_user_by_email(email: str):
    for u in users.values():
        if u["email"] == email:
            return u
    return None


def get_user_by_phone(phone: str):
    for u in users.values():
        if u["phone"] == phone:
            return u
    return None


def create_user(name, email, password, phone):
    uid = "user_" + str(uuid.uuid4().hex[:8])
    user = {"id": uid, "name": name, "email": email, "password": password,
            "phone": phone, "wallet": 500.0, "savings": 0.0}
    users[uid] = user
    return user


def add_transaction(user_id, t_type, amount, description):
    txn = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": t_type,
        "amount": amount,
        "description": description,
        "date": datetime.now().isoformat()
    }
    transactions.append(txn)
    return txn


def get_user_transactions(user_id):
    return sorted(
        [t for t in transactions if t["user_id"] == user_id],
        key=lambda x: x["date"], reverse=True
    )


def get_user_expenses(user_id):
    return sorted(
        [e for e in expenses if e["user_id"] == user_id],
        key=lambda x: x["date"], reverse=True
    )


# ─── Auto-categorize keywords ─────────────────────────────────────────────────
_CATEGORY_KEYWORDS = {
    "Food": ["food", "cafe", "coffee", "tea", "restaurant", "swiggy", "zomato", "pizza", "burger", "lunch", "dinner", "breakfast", "snack", "grocery", "eat", "meal", "canteen", "mess", "biryani", "chai"],
    "Transport": ["bus", "auto", "cab", "uber", "ola", "metro", "train", "fuel", "petrol", "diesel", "travel", "ride", "commute", "parking"],
    "Shopping": ["amazon", "flipkart", "shop", "store", "mall", "cloth", "shoe", "stationery", "gadget", "electronics", "buy", "purchase", "order"],
    "Entertainment": ["movie", "netflix", "spotify", "game", "concert", "party", "outing", "fun", "subscription", "hotstar", "prime"],
    "Education": ["book", "course", "tuition", "udemy", "coursera", "class", "exam", "fee", "college", "school", "study", "library"],
}


def _categorize_description(description: str) -> str:
    desc_lower = description.lower()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "Other"


def auto_add_expense(user_id: str, amount: float, description: str):
    """Auto-create an expense from a wallet debit transaction."""
    category = _categorize_description(description)
    expense = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "category": category,
        "description": description,
        "date": datetime.now().isoformat()
    }
    expenses.append(expense)
    return expense

