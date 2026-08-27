import datetime
import hashlib
import logging
import secrets
from datetime import timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import PasswordResetOTP, User
from backend.schemas import AccountUpdate, PasswordResetRequest, PasswordResetVerify, UserRegister, UserLogin, Token, UserResponse
from backend.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)

def normalise_phone(phone: str) -> str:
    value = ''.join(character for character in phone if character.isdigit() or character == '+')
    if value.startswith('0') and len(value) == 10:
        value = '+91' + value[1:]
    elif value.isdigit() and len(value) == 10:
        value = '+91' + value
    if len(value.replace('+', '')) < 10:
        raise HTTPException(status_code=422, detail="Enter a valid phone number")
    return value

def send_otp(phone: str, otp: str):
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        from twilio.rest import Client
        Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN).messages.create(
            body=f"Your FarmGuru password reset code is {otp}. It expires in 10 minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone,
        )
    else:
        logger.info("Password reset OTP for %s: %s", phone, otp)

@router.post("/register", response_model=Token)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )

    phone = normalise_phone(user_data.phone)
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=400, detail="Phone number is already registered")

    # Use the role provided, default to "farmer"
    safe_role = user_data.role.lower() if user_data.role else "farmer"


    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        phone=phone,
        password_hash=hashed_pwd,
        full_name=user_data.full_name,
        role=safe_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return Token(access_token=token, user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    identifier = login_data.identifier.strip()
    user = db.query(User).filter(
        User.email == identifier.lower() if '@' in identifier else User.phone == normalise_phone(identifier)
    ).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.patch("/account", response_model=UserResponse)
def update_account(account_data: AccountUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    values = account_data.model_dump(exclude_unset=True)
    if 'email' in values and db.query(User).filter(User.email == values['email'], User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Email address is already registered")
    if values.get('phone'):
        values['phone'] = normalise_phone(values['phone'])
        if db.query(User).filter(User.phone == values['phone'], User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Phone number is already registered")
    for key, value in values.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/password-reset/request")
def request_password_reset(reset_data: PasswordResetRequest, db: Session = Depends(get_db)):
    phone = normalise_phone(reset_data.phone)
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account was found for this phone number")
    otp = f"{secrets.randbelow(1000000):06d}"
    db.add(PasswordResetOTP(
        user_id=user.id, phone=phone,
        otp_hash=hashlib.sha256(otp.encode()).hexdigest(),
        expires_at=datetime.datetime.now(timezone.utc) + timedelta(minutes=10)
    ))
    db.commit()
    send_otp(phone, otp)
    return {"message": "Verification code sent to your phone"}

@router.post("/password-reset/verify")
def verify_password_reset(reset_data: PasswordResetVerify, db: Session = Depends(get_db)):
    phone = normalise_phone(reset_data.phone)
    challenge = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.phone == phone, PasswordResetOTP.used.is_(False)
    ).order_by(PasswordResetOTP.created_at.desc()).first()
    expires_at = challenge.expires_at.replace(tzinfo=timezone.utc) if challenge else None
    if not challenge or not expires_at or expires_at < datetime.datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This verification code is invalid or expired")
    if not secrets.compare_digest(challenge.otp_hash, hashlib.sha256(reset_data.otp.encode()).hexdigest()):
        raise HTTPException(status_code=400, detail="Incorrect verification code")
    user = db.query(User).filter(User.id == challenge.user_id).first()
    user.password_hash = hash_password(reset_data.new_password)
    challenge.used = True
    db.commit()
    return {"message": "Password updated. You can now sign in."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
