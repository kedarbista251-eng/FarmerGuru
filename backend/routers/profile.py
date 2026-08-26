from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, FarmProfile
from backend.schemas import FarmProfileUpdate, FarmProfileResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=FarmProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmProfile).filter(FarmProfile.user_id == current_user.id).first()
    if not profile:
        # Return empty profile if none exists
        profile = FarmProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.post("", response_model=FarmProfileResponse)
def update_profile(
    profile_data: FarmProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(FarmProfile).filter(FarmProfile.user_id == current_user.id).first()
    if not profile:
        profile = FarmProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile
