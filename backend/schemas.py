from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class FarmProfileUpdate(BaseModel):
    name: Optional[str] = None
    profile_pic: Optional[str] = None
    acreage: Optional[float] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    irrigation: Optional[str] = None
    district: Optional[str] = None
    active_crop: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest: Optional[str] = None

class FarmProfileResponse(FarmProfileUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

