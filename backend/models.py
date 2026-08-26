from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="farmer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("FarmProfile", back_populates="user", uselist=False)

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

