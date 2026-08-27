from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import KnowledgeBaseItem, SuggestedPrompt
from backend.schemas import KnowledgeBaseItemResponse, SuggestedPromptResponse

router = APIRouter(prefix="/api/voice", tags=["Voice Radio"])

@router.get("/prompts", response_model=list[SuggestedPromptResponse])
def get_prompts(db: Session = Depends(get_db)):
    return db.query(SuggestedPrompt).order_by(SuggestedPrompt.id).all()

@router.get("/knowledge", response_model=list[KnowledgeBaseItemResponse])
def get_knowledge(db: Session = Depends(get_db)):
    return db.query(KnowledgeBaseItem).order_by(KnowledgeBaseItem.id).all()