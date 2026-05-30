from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core import security
from app.core.config import settings
from app.models.models import User, College
from app.schemas.schemas import Token, UserResponse, CollegeCreate, UserCreate

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register-college", response_model=UserResponse)
def register_college(
    *,
    db: Session = Depends(get_db),
    college_in: CollegeCreate,
    admin_name: str,
    admin_password: str
) -> Any:
    """Create a new college and its primary admin user."""
    # Check if college slug or email already exists
    if db.query(College).filter(College.slug == college_in.slug).first():
        raise HTTPException(status_code=400, detail="College slug already exists")
    
    if db.query(College).filter(College.email == college_in.email).first():
        raise HTTPException(status_code=400, detail="College email already registered")

    if db.query(User).filter(User.email == college_in.email).first():
        raise HTTPException(status_code=400, detail="User email already registered")

    try:
        # Create College
        new_college = College(
            name=college_in.name,
            slug=college_in.slug,
            email=college_in.email,
            subscription_plan=college_in.subscription_plan
        )
        db.add(new_college)
        db.flush() # Flush to get the ID without committing yet

        # Create Admin User for this college
        new_user = User(
            college_id=new_college.id,
            name=admin_name,
            email=college_in.email, # Admin email same as college email for registration
            hashed_password=security.get_password_hash(admin_password),
            role="college_admin",
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        if "UniqueViolation" in str(e) or "duplicate key" in str(e).lower():
             raise HTTPException(status_code=400, detail="College or User already exists")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
