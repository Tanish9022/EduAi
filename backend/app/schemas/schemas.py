from datetime import datetime, time
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# College Schemas
class CollegeBase(BaseModel):
    name: str
    slug: str
    email: EmailStr
    subscription_plan: Optional[str] = "basic"

class CollegeCreate(CollegeBase):
    pass

class CollegeResponse(CollegeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str
    college_id: int

class UserResponse(UserBase):
    id: int
    college_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    college_id: Optional[int] = None
    role: Optional[str] = None

# Enquiry Schemas
class EnquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    course: Optional[str] = None
    college_slug: str

class EnquiryResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[EmailStr] = None
    course: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    phone_number: str
    department: Optional[str] = None
    year: Optional[str] = None
    division: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = {"assignments": True, "placements": True, "scholarships": True, "events": True}

class StudentCreate(StudentBase):
    college_id: int

class StudentResponse(StudentBase):
    id: int
    college_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Timetable Schemas
class TimetableBase(BaseModel):
    department: str
    year: str
    division: str
    day: str
    start_time: time
    end_time: time
    subject: str
    faculty: Optional[str] = None
    room: Optional[str] = None

class TimetableCreate(TimetableBase):
    college_id: int

class TimetableResponse(TimetableBase):
    id: int
    college_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignment_type: Optional[str] = None
    subject: str
    faculty_name: Optional[str] = None
    due_date: datetime
    department: Optional[str] = None
    year: Optional[str] = None
    division: Optional[str] = None
    attachment_url: Optional[str] = None
    status: Optional[str] = "active"
    search_keywords: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    college_id: int

class AssignmentResponse(AssignmentBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Notice Schemas
class NoticeBase(BaseModel):
    title: str
    content: str
    priority: Optional[str] = "Normal"
    expiry_date: Optional[datetime] = None
    attachment_url: Optional[str] = None
    target_audience: Optional[str] = None
    search_keywords: Optional[str] = None

class NoticeCreate(NoticeBase):
    college_id: int

class NoticeResponse(NoticeBase):
    id: int
    college_id: int
    published_date: datetime
    class Config:
        from_attributes = True

# Event Schemas
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    department: Optional[str] = None
    search_keywords: Optional[str] = None

class EventCreate(EventBase):
    college_id: int

class EventResponse(EventBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Placement Schemas
class PlacementBase(BaseModel):
    company_name: str
    role: str
    package: Optional[str] = None
    drive_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    apply_link: Optional[str] = None
    search_keywords: Optional[str] = None

class PlacementCreate(PlacementBase):
    college_id: int

class PlacementResponse(PlacementBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Scholarship Schemas
class ScholarshipBase(BaseModel):
    name: str
    eligibility: Optional[str] = None
    deadline: Optional[datetime] = None
    application_link: Optional[str] = None
    target_department: Optional[str] = None
    target_year: Optional[str] = None
    search_keywords: Optional[str] = None

class ScholarshipCreate(ScholarshipBase):
    college_id: int

class ScholarshipResponse(ScholarshipBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ExamSchedule Schemas
class ExamScheduleBase(BaseModel):
    exam_name: str
    subject: str
    date_time: datetime
    department: Optional[str] = None
    year: Optional[str] = None
    search_keywords: Optional[str] = None

class ExamScheduleCreate(ExamScheduleBase):
    college_id: int

class ExamScheduleResponse(ExamScheduleBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Resource Schemas
class ResourceBase(BaseModel):
    title: str
    category: str
    file_url: str
    department: Optional[str] = None
    year: Optional[str] = None
    search_keywords: Optional[str] = None

class ResourceCreate(ResourceBase):
    college_id: int

class ResourceResponse(ResourceBase):
    id: int
    college_id: int
    created_at: datetime
    class Config:
        from_attributes = True
