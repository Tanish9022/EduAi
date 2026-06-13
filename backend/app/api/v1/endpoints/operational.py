from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api import deps
from app.models.models import User, Assignment, Notice, Event, Placement, Scholarship, ExamSchedule, Resource
from typing import List
from app.schemas import schemas

router = APIRouter()

# Assignments
@router.post("/assignments", response_model=schemas.AssignmentResponse)
def create_assignment(
    assignment: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_assignment = Assignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.get("/assignments", response_model=List[schemas.AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Assignment).filter(Assignment.college_id == current_user.college_id).all()

# Notices
@router.post("/notices", response_model=schemas.NoticeResponse)
def create_notice(
    notice: schemas.NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_notice = Notice(**notice.model_dump())
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)

    if db_notice.priority == "High":
        from app.services.notification_engine import notification_engine
        notification_engine.queue_instant_notification(
            college_id=db_notice.college_id,
            notification_type="notice",
            title=db_notice.title,
            body=db_notice.content,
            item=db_notice
        )

    return db_notice

@router.get("/notices", response_model=List[schemas.NoticeResponse])
def get_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Notice).filter(Notice.college_id == current_user.college_id).all()

# Events
@router.post("/events", response_model=schemas.EventResponse)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/events", response_model=List[schemas.EventResponse])
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Event).filter(Event.college_id == current_user.college_id).all()

# Placements
@router.post("/placements", response_model=schemas.PlacementResponse)
def create_placement(
    placement: schemas.PlacementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_placement = Placement(**placement.model_dump())
    db.add(db_placement)
    db.commit()
    db.refresh(db_placement)
    return db_placement

@router.get("/placements", response_model=List[schemas.PlacementResponse])
def get_placements(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Placement).filter(Placement.college_id == current_user.college_id).all()

# Scholarships
@router.post("/scholarships", response_model=schemas.ScholarshipResponse)
def create_scholarship(
    scholarship: schemas.ScholarshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_scholarship = Scholarship(**scholarship.model_dump())
    db.add(db_scholarship)
    db.commit()
    db.refresh(db_scholarship)
    return db_scholarship

@router.get("/scholarships", response_model=List[schemas.ScholarshipResponse])
def get_scholarships(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Scholarship).filter(Scholarship.college_id == current_user.college_id).all()

# Resources
@router.post("/resources", response_model=schemas.ResourceResponse)
def create_resource(
    resource: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/resources", response_model=List[schemas.ResourceResponse])
def get_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(Resource).filter(Resource.college_id == current_user.college_id).all()
