import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

from backend.database import Base, SessionLocal, engine
from backend.models import AgriInput, BankBranch, BankLoan, Clan, Crop, GovtScheme, KnowledgeBaseItem, MandiRate, NewsItem, Post, Reply, SuggestedPrompt, TickerAlert

def seed_table(db, model, rows, key):
    for values in rows:
        if not db.query(model).filter(getattr(model, key) == values[key]).first():
            db.add(model(**values))

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_table(db, MandiRate, [
            {"crop": "Paddy (Common)", "mandi": "Rourkela Yard", "min_price": 2180, "max_price": 2369, "modal_price": 2300, "trend": "up", "change": "+₹45"},
            {"crop": "Millets (Ragi)", "mandi": "Bargarh Mandi", "min_price": 3600, "max_price": 3850, "modal_price": 3800, "trend": "stable", "change": "₹0"},
            {"crop": "Mustard (Sarson)", "mandi": "Sambalpur Hub", "min_price": 5400, "max_price": 5800, "modal_price": 5650, "trend": "up", "change": "+₹120"},
        ], "crop")
        seed_table(db, AgriInput, [
            {"category": "manure", "title": "Organic Vermicompost", "price": "₹12 / kg", "location": "Local Co-op Hub, Panposh", "contact": "9876543210", "expected": "Government Certified", "badge": "Certified"},
            {"category": "seeds", "title": "Certified HYV Ragi Seeds", "price": "₹55 / kg", "location": "District Seed Store, Sundargarh", "contact": "9876543212", "expected": "50% Govt Subsidy", "badge": "High Yield"},
            {"category": "equipment", "title": "Power Rotavator (6 Feet)", "price": "₹450 / hour", "location": "Rourkela Custom Hiring Center", "contact": "9876543217", "expected": "Available", "badge": "Soil Tillage"},
        ], "title")
        crops = [{"id": "ragi", "name": "Millets (Ragi)", "season": "Kharif / Monsoon", "suitable_months": json.dumps(["June", "July", "August", "September"]), "soil_type": "Alluvial & Loamy", "ideal_ph_min": 5.5, "ideal_ph_max": 7.5, "npk_req": json.dumps({"n": "Med", "p": "Low", "k": "Med"}), "water_req": "Low (300-450mm)", "est_cost_per_acre": 12000, "est_yield_quintal": 14, "market_price_per_quintal": 3800, "companion_crop": "Pigeon Pea (Arhar)", "monthly_prices": json.dumps([3400, 3500, 3650, 3800, 3950, 4100, 3800]), "productivity_steps": json.dumps(["Plant in 30cm rows.", "Intercrop with pigeon pea.", "Irrigate at flowering."])}]
        seed_table(db, Crop, crops, "id")
        seed_table(db, GovtScheme, [{"id": "pm-kisan", "title": "PM-KISAN Samman Nidhi", "category": "Central Income Support", "benefit": "₹6,000 / year via DBT.", "eligibility": "Landholding farmer families.", "apply_url": "https://pmkisan.gov.in/", "portal": "PM-KISAN Portal"}, {"id": "kalia", "title": "KALIA Scheme (Odisha State)", "category": "State Financial Assistance", "benefit": "Financial assistance for Odisha farmers.", "eligibility": "Small and marginal farmers in Odisha.", "apply_url": "https://kalia.odisha.gov.in/", "portal": "KALIA Odisha Portal"}], "id")
        seed_table(db, BankLoan, [{"id": "sbi-kcc", "bank": "State Bank of India (SBI)", "loan_name": "SBI Kisan Credit Card", "base_rate": 7.0, "subvention_rate": 3.0, "max_limit": "Up to ₹5,000,000", "tenure": "5 Years", "features": "Flexible crop credit via KCC.", "direct_link": "https://sbi.bank.in/", "docs": json.dumps(["Land Record", "Aadhaar Card"])}], "id")
        seed_table(db, BankBranch, [{"district": "Rourkela", "bank": "SBI Main Branch Rourkela", "address": "Civic Centre, Sector 19, Rourkela", "phone": "1800-11-2211"}], "bank")
        seed_table(db, NewsItem, [{"id": "nat-1", "type": "national", "title": "MSP rates for Kharif crops", "source": "Press Information Bureau", "date": "August 2026", "snippet": "Updated support price information for farmers.", "link": "https://pib.gov.in/"}], "id")
        seed_table(db, Clan, [{"id": "agronomy", "name": "Agronomy Specialists", "icon": "🔬", "members": 12, "topic": "Crop Health & Soil", "tag": "Crop Health"}, {"id": "mandi", "name": "Odisha Mandi Guild", "icon": "📈", "members": 480, "topic": "Price Trends & Logistics", "tag": "Mandi Prices"}, {"id": "organic", "name": "Organic Farming Clan", "icon": "🌱", "members": 210, "topic": "Bio-pesticides & Compost", "tag": "Organic"}], "id")
        seed_table(db, TickerAlert, [{"text": "Odisha Mandi: Paddy rates up across Sambalpur and Bargarh yards"}, {"text": "Pest Warning: Inspect maize leaves early morning"}], "text")
        seed_table(db, SuggestedPrompt, [{"text": "What is the best crop to plant this season?"}, {"text": "How can I maintain soil moisture during hot days?"}], "text")
        seed_table(db, KnowledgeBaseItem, [{"keywords": json.dumps(["weather", "rain", "temperature"]), "reply": "Monitor soil moisture before heavy irrigation."}, {"keywords": json.dumps(["price", "mandi", "market"]), "reply": "Check local market yards around 8 AM for price updates."}], "reply")
        db.commit()
        print("FarmGuru seed data is ready.")
    finally:
        db.close()

if __name__ == "__main__":
    main()