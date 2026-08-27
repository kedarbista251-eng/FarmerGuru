from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.auth import get_current_user
from backend.database import get_db
from backend.models import AgriInput, MandiRate, ProduceLot, User
from backend.schemas import AgriInputResponse, MandiRateResponse, ProduceLotCreate, ProduceLotResponse

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

@router.get("/rates", response_model=list[MandiRateResponse])
def get_rates(db: Session = Depends(get_db)):
    return db.query(MandiRate).order_by(MandiRate.mandi, MandiRate.crop).all()

@router.get("/inputs", response_model=list[AgriInputResponse])
def get_inputs(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(AgriInput)
    if category:
        query = query.filter(AgriInput.category == category)
    return query.order_by(AgriInput.id).all()

@router.get("/lots", response_model=list[ProduceLotResponse])
def get_lots(db: Session = Depends(get_db)):
    return db.query(ProduceLot).order_by(ProduceLot.id.desc()).all()

@router.post("/lots", response_model=ProduceLotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(data: ProduceLotCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lot = ProduceLot(user_id=current_user.id, contact_name=data.contact_name or current_user.full_name, **data.model_dump(exclude={"contact_name"}))
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot