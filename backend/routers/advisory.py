from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Crop
from backend.schemas import CropResponse

router = APIRouter(prefix="/api/advisory", tags=["Advisory"])

@router.get("/crops", response_model=list[CropResponse])
def get_crops(db: Session = Depends(get_db)):
    return db.query(Crop).order_by(Crop.name).all()

@router.get("/crops/{crop_id}", response_model=CropResponse)
def get_crop(crop_id: str, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop