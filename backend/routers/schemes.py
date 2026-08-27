from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import BankBranch, BankLoan, GovtScheme, NewsItem
from backend.schemas import BankBranchResponse, BankLoanResponse, GovtSchemeResponse, NewsItemResponse

router = APIRouter(prefix="/api/schemes", tags=["Schemes and Loans"])

@router.get("/govt", response_model=list[GovtSchemeResponse])
def get_schemes(db: Session = Depends(get_db)):
    return db.query(GovtScheme).order_by(GovtScheme.title).all()

@router.get("/loans", response_model=list[BankLoanResponse])
def get_loans(db: Session = Depends(get_db)):
    return db.query(BankLoan).order_by(BankLoan.bank).all()

@router.get("/branches", response_model=list[BankBranchResponse])
def get_branches(district: str | None = None, db: Session = Depends(get_db)):
    query = db.query(BankBranch)
    if district:
        query = query.filter(BankBranch.district.ilike(f"%{district}%"))
    return query.order_by(BankBranch.bank).all()

@router.get("/news", response_model=list[NewsItemResponse])
def get_news(db: Session = Depends(get_db)):
    return db.query(NewsItem).order_by(NewsItem.id).all()