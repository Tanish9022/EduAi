from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from pydantic import BaseModel
from app.api import deps
from app.models.models import User, NotificationLog, NotificationQueue

router = APIRouter()

class BroadcastRequest(BaseModel):
    message: str
    channel: str

@router.post("/broadcast")
async def send_broadcast(
    request: BroadcastRequest,
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    # Old static broadcast logic kept for reference, but could trigger instant notices
    print(f"BROADCAST [{request.channel.upper()}]: {request.message}")
    return {"status": "success", "message": "Broadcast sent successfully"}

@router.get("/logs")
def get_notification_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    logs = db.query(NotificationLog).filter(
        NotificationLog.college_id == current_user.college_id
    ).order_by(NotificationLog.sent_at.desc()).limit(100).all()
    
    return logs

@router.get("/queue")
def get_notification_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    queue = db.query(NotificationQueue).filter(
        NotificationQueue.college_id == current_user.college_id
    ).order_by(NotificationQueue.created_at.desc()).limit(100).all()
    
    return queue

@router.get("/analytics")
def get_notification_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    sent = db.query(func.count(NotificationLog.id)).filter(
        NotificationLog.college_id == current_user.college_id,
        NotificationLog.status == "sent"
    ).scalar()
    
    failed = db.query(func.count(NotificationLog.id)).filter(
        NotificationLog.college_id == current_user.college_id,
        NotificationLog.status == "failed"
    ).scalar()
    
    pending = db.query(func.count(NotificationQueue.id)).filter(
        NotificationQueue.college_id == current_user.college_id,
        NotificationQueue.status == "pending"
    ).scalar()
    
    return {
        "sent": sent,
        "failed": failed,
        "pending": pending
    }
