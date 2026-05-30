from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class College(Base):
    __tablename__ = "colleges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    subscription_plan = Column(String, default="basic")
    wa_phone_number_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="college")
    documents = relationship("Document", back_populates="college")
    chat_logs = relationship("ChatLog", back_populates="college")
    broadcasts = relationship("Broadcast", back_populates="college")
    analytics = relationship("Analytics", back_populates="college", uselist=False)
    subscription = relationship("Subscription", back_populates="college", uselist=False)
    enquiries = relationship("Enquiry", back_populates="college")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # super_admin, college_admin, staff
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="users")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, default="uploaded") # uploaded, processing, indexed, failed
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="documents")

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    response_time = Column(Float)
    channel = Column(String, default="web")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="chat_logs")

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    total_queries = Column(Integer, default=0)
    avg_response_time = Column(Float, default=0.0)
    active_users = Column(Integer, default=0)

    college = relationship("College", back_populates="analytics")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    plan = Column(String, nullable=False)
    status = Column(String, default="active")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

    college = relationship("College", back_populates="subscription")

class Broadcast(Base):
    __tablename__ = "broadcasts"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String, nullable=False)
    status = Column(String, nullable=False) # sent, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="broadcasts")

class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    course = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    college = relationship("College", back_populates="enquiries")
