from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import os

from app.api import deps
from app.models.models import User, ChatLog
from app.database.connection import get_db

router = APIRouter()

# Storage directory inside backend (relative to this file)
STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "storage"))

@router.get("/overview")
async def get_analytics_overview(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    college_id = current_user.college_id
    
    total_queries = db.query(func.count(ChatLog.id)).filter(ChatLog.college_id == college_id).scalar() or 0
    avg_response_time = db.query(func.avg(ChatLog.response_time)).filter(ChatLog.college_id == college_id).scalar() or 0.0
    
    # Students helped is an approximation (distinct sessions/users if we had them, for now just queries / 3)
    students_helped = total_queries // 3
    
    documents_indexed = 0
    if os.path.exists(STORAGE_DIR):
        documents_indexed = len([f for f in os.listdir(STORAGE_DIR) if f != ".gitkeep"])
        
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    queries_today = db.query(func.count(ChatLog.id)).filter(
        ChatLog.college_id == college_id,
        func.date(ChatLog.created_at) == today
    ).scalar() or 0
    
    queries_this_week = db.query(func.count(ChatLog.id)).filter(
        ChatLog.college_id == college_id,
        func.date(ChatLog.created_at) >= week_ago
    ).scalar() or 0

    return {
        "total_queries": total_queries,
        "avg_response_time_ms": avg_response_time,
        "students_helped": students_helped,
        "documents_indexed": documents_indexed,
        "queries_today": queries_today,
        "queries_this_week": queries_this_week
    }

@router.get("/queries-over-time")
async def get_queries_over_time(
    period: str = "7d",
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    days = 7 if period == "7d" else 30
    start_date = datetime.utcnow().date() - timedelta(days=days)
    
    results = db.query(
        func.date(ChatLog.created_at).label('date'),
        func.count(ChatLog.id).label('count')
    ).filter(
        ChatLog.college_id == current_user.college_id,
        func.date(ChatLog.created_at) >= start_date
    ).group_by('date').order_by('date').all()
    
    return [{"date": r.date.strftime("%Y-%m-%d"), "count": r.count} for r in results]

@router.get("/top-questions")
async def get_top_questions(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    # Simplified approach: grouping by exact text
    results = db.query(
        ChatLog.user_query.label('question'),
        func.count(ChatLog.id).label('count')
    ).filter(
        ChatLog.college_id == current_user.college_id
    ).group_by(ChatLog.user_query).order_by(func.count(ChatLog.id).desc()).limit(10).all()
    
    return [{"question": r.question, "count": r.count} for r in results]
