from fastapi import APIRouter
from app.api.v1.endpoints import auth, ai, whatsapp, analytics, notifications, students, operational

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(operational.router, prefix="/operational", tags=["operational"])
