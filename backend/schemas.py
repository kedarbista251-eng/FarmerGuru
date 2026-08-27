from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List

class UserRegister(BaseModel):
    email: EmailStr
    phone: str
    password: str
    full_name: str
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    phone: Optional[str] = None
    full_name: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)

class AccountUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class PasswordResetRequest(BaseModel):
    phone: str

class PasswordResetVerify(BaseModel):
    phone: str
    otp: str
    new_password: str

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


class MandiRateResponse(BaseModel):
    id: int
    crop: str
    mandi: str
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    modal_price: Optional[float] = None
    trend: Optional[str] = None
    change: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class AgriInputResponse(BaseModel):
    id: int
    category: str
    title: str
    price: str
    location: Optional[str] = None
    contact: Optional[str] = None
    expected: Optional[str] = None
    badge: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class ProduceLotCreate(BaseModel):
    title: str
    quantity: str
    price: str
    location: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    expected: Optional[str] = None


class ProduceLotResponse(ProduceLotCreate):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


class CropResponse(BaseModel):
    id: str
    name: str
    season: Optional[str] = None
    suitable_months: Optional[str] = None
    soil_type: Optional[str] = None
    ideal_ph_min: Optional[float] = None
    ideal_ph_max: Optional[float] = None
    npk_req: Optional[str] = None
    water_req: Optional[str] = None
    est_cost_per_acre: Optional[float] = None
    est_yield_quintal: Optional[float] = None
    market_price_per_quintal: Optional[float] = None
    companion_crop: Optional[str] = None
    monthly_prices: Optional[str] = None
    productivity_steps: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class GovtSchemeResponse(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    benefit: Optional[str] = None
    eligibility: Optional[str] = None
    apply_url: Optional[str] = None
    portal: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class BankLoanResponse(BaseModel):
    id: str
    bank: Optional[str] = None
    loan_name: Optional[str] = None
    base_rate: Optional[float] = None
    subvention_rate: Optional[float] = None
    max_limit: Optional[str] = None
    tenure: Optional[str] = None
    features: Optional[str] = None
    direct_link: Optional[str] = None
    docs: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class BankBranchResponse(BaseModel):
    id: int
    district: Optional[str] = None
    bank: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class NewsItemResponse(BaseModel):
    id: str
    type: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    date: Optional[str] = None
    snippet: Optional[str] = None
    link: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class ClanResponse(BaseModel):
    id: str
    name: Optional[str] = None
    icon: Optional[str] = None
    members: int = 0
    topic: Optional[str] = None
    tag: Optional[str] = None
    joined: bool = False
    model_config = ConfigDict(from_attributes=True)


class TickerAlertResponse(BaseModel):
    id: int
    text: str
    model_config = ConfigDict(from_attributes=True)


class ReplyCreate(BaseModel):
    text: str


class ReplyResponse(ReplyCreate):
    id: int
    post_id: int
    user_id: Optional[int] = None
    author_name: Optional[str] = None
    time: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class PostCreate(BaseModel):
    q: str
    clan_id: Optional[str] = None
    image: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    badge_color: Optional[str] = None
    clan_id: Optional[str] = None
    q: Optional[str] = None
    a: Optional[str] = None
    likes: int = 0
    time: Optional[str] = None
    tag: Optional[str] = None
    image: Optional[str] = None
    replies: List[ReplyResponse] = []
    model_config = ConfigDict(from_attributes=True)


class SuggestedPromptResponse(BaseModel):
    id: int
    text: str
    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseItemResponse(BaseModel):
    id: int
    keywords: str
    reply: str
    model_config = ConfigDict(from_attributes=True)

