from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, func, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="farmer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("FarmProfile", back_populates="user", uselist=False)
    produce_lots = relationship("ProduceLot", back_populates="user")
    posts = relationship("Post", back_populates="user")
    replies = relationship("Reply", back_populates="user")

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phone = Column(String, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FarmProfile(Base):
    __tablename__ = "farm_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    profile_pic = Column(Text, nullable=True)
    acreage = Column(Float, default=0.0)
    soil_type = Column(String, nullable=True)
    soil_ph = Column(Float, nullable=True)
    irrigation = Column(String, nullable=True)
    district = Column(String, nullable=True)
    active_crop = Column(String, nullable=True)
    sowing_date = Column(String, nullable=True)
    expected_harvest = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")

# MARKETPLACE MODELS
class MandiRate(Base):
    __tablename__ = "mandi_rates"
    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String, nullable=False)
    mandi = Column(String, nullable=False)
    min_price = Column(Float)
    max_price = Column(Float)
    modal_price = Column(Float)
    trend = Column(String)
    change = Column(String)

class AgriInput(Base):
    __tablename__ = "agri_inputs"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False) # 'manure', 'seeds', 'equipment'
    title = Column(String, nullable=False)
    price = Column(String, nullable=False)
    location = Column(String)
    contact = Column(String)
    expected = Column(String)
    badge = Column(String)

class ProduceLot(Base):
    __tablename__ = "produce_lots"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    price = Column(String, nullable=False)
    location = Column(String)
    contact_name = Column(String)
    phone = Column(String)
    expected = Column(String)
    
    user = relationship("User", back_populates="produce_lots")

# CROP ADVISOR MODELS
class Crop(Base):
    __tablename__ = "crops"
    id = Column(String, primary_key=True, index=True) # e.g. 'ragi'
    name = Column(String, nullable=False)
    season = Column(String)
    suitable_months = Column(String) # JSON string
    soil_type = Column(String)
    ideal_ph_min = Column(Float)
    ideal_ph_max = Column(Float)
    npk_req = Column(String) # JSON string
    water_req = Column(String)
    est_cost_per_acre = Column(Float)
    est_yield_quintal = Column(Float)
    market_price_per_quintal = Column(Float)
    companion_crop = Column(String)
    monthly_prices = Column(String) # JSON string
    productivity_steps = Column(Text) # JSON string

# SCHEMES AND LOANS
class GovtScheme(Base):
    __tablename__ = "govt_schemes"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String)
    benefit = Column(Text)
    eligibility = Column(Text)
    apply_url = Column(String)
    portal = Column(String)

class BankLoan(Base):
    __tablename__ = "bank_loans"
    id = Column(String, primary_key=True, index=True)
    bank = Column(String)
    loan_name = Column(String)
    base_rate = Column(Float)
    subvention_rate = Column(Float)
    max_limit = Column(String)
    tenure = Column(String)
    features = Column(Text)
    direct_link = Column(String)
    docs = Column(Text) # JSON string

class BankBranch(Base):
    __tablename__ = "bank_branches"
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String)
    bank = Column(String)
    address = Column(Text)
    phone = Column(String)

class NewsItem(Base):
    __tablename__ = "news_items"
    id = Column(String, primary_key=True, index=True)
    type = Column(String) # 'national', 'regional'
    title = Column(String)
    source = Column(String)
    date = Column(String)
    snippet = Column(Text)
    link = Column(String)

# COMMUNITY
class Clan(Base):
    __tablename__ = "clans"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    icon = Column(String)
    members = Column(Integer, default=0)
    topic = Column(String)
    tag = Column(String)
    joined = Column(Boolean, default=False)
    
    posts = relationship("Post", back_populates="clan")

class TickerAlert(Base):
    __tablename__ = "ticker_alerts"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String, nullable=True) # Fallback for seeded data
    author_role = Column(String, nullable=True)
    badge_color = Column(String, nullable=True)
    clan_id = Column(String, ForeignKey("clans.id"))
    q = Column(Text)
    a = Column(Text)
    likes = Column(Integer, default=0)
    time = Column(String)
    tag = Column(String)
    image = Column(Text, nullable=True)

    user = relationship("User", back_populates="posts")
    clan = relationship("Clan", back_populates="posts")
    replies = relationship("Reply", back_populates="post")

class Reply(Base):
    __tablename__ = "replies"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String, nullable=True)
    text = Column(Text)
    time = Column(String)

    post = relationship("Post", back_populates="replies")
    user = relationship("User", back_populates="replies")

# VOICE RADIO
class SuggestedPrompt(Base):
    __tablename__ = "suggested_prompts"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)

class KnowledgeBaseItem(Base):
    __tablename__ = "knowledge_base"
    id = Column(Integer, primary_key=True, index=True)
    keywords = Column(Text) # JSON string
    reply = Column(Text)
