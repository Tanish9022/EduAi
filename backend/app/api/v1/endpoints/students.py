from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api import deps
from app.models.models import User, Student
from typing import List
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.StudentResponse])
def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Retrieve all registered students for the college.
    """
    students = db.query(Student).filter(Student.college_id == current_user.college_id).all()
    return students
