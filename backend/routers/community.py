from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload
from backend.auth import get_current_user
from backend.database import get_db
from backend.models import Clan, Post, Reply, TickerAlert, User
from backend.schemas import ClanResponse, PostCreate, PostResponse, ReplyCreate, ReplyResponse, TickerAlertResponse

router = APIRouter(prefix="/api/community", tags=["Community"])

@router.get("/clans", response_model=list[ClanResponse])
def get_clans(db: Session = Depends(get_db)):
    return db.query(Clan).order_by(Clan.name).all()

@router.get("/alerts", response_model=list[TickerAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(TickerAlert).order_by(TickerAlert.id).all()

@router.get("/posts", response_model=list[PostResponse])
def get_posts(db: Session = Depends(get_db)):
    return db.query(Post).options(joinedload(Post.replies)).order_by(Post.id.desc()).all()

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(data: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clan = db.query(Clan).filter(Clan.id == data.clan_id).first() if data.clan_id else None
    post = Post(user_id=current_user.id, author_name=current_user.full_name or current_user.email, author_role="Registered Farmer", badge_color="#0284c7", q=data.q, a=f"Routed to {clan.name if clan else 'Specialists'}. Reviewing query.", clan_id=data.clan_id, tag=clan.tag if clan else "General Inquiry", image=data.image, time="Just now")
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.post("/posts/{post_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(post_id: int, data: ReplyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reply = Reply(post_id=post_id, user_id=current_user.id, author_name=current_user.full_name or current_user.email, text=data.text, time="Just now")
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply