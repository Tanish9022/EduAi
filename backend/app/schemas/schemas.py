from datetime import datetime
from typing import Optional, List
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
