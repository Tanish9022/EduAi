from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text, Time, JSON
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
    students = relationship("Student", back_populates="college")
    timetables = relationship("Timetable", back_populates="college")
    assignments = relationship("Assignment", back_populates="college")
    notices = relationship("Notice", back_populates="college")
    events = relationship("Event", back_populates="college")
    placements = relationship("Placement", back_populates="college")
    scholarships = relationship("Scholarship", back_populates="college")
    exam_schedules = relationship("ExamSchedule", back_populates="college")
    resources = relationship("Resource", back_populates="college")
    query_logs = relationship("QueryLog", back_populates="college")
    notification_rules = relationship("NotificationRule", back_populates="college")
    notification_templates = relationship("NotificationTemplate", back_populates="college")
    notification_queue = relationship("NotificationQueue", back_populates="college")
    notification_logs = relationship("NotificationLog", back_populates="college")

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
    status = Column(String, default="uploaded")
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
    status = Column(String, nullable=False)
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

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    phone_number = Column(String, nullable=False, unique=True, index=True)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)
    division = Column(String, nullable=True)
    notification_preferences = Column(JSON, default={"assignments": True, "placements": True, "scholarships": True, "events": True})
    last_notification_sent = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    college = relationship("College", back_populates="students")
    query_logs = relationship("QueryLog", back_populates="student")
    notification_logs = relationship("NotificationLog", back_populates="student")
    notification_queue = relationship("NotificationQueue", back_populates="student")

class Timetable(Base):
    __tablename__ = "timetables"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    department = Column(String, nullable=False)
    year = Column(String, nullable=False)
    division = Column(String, nullable=False)
    day = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    subject = Column(String, nullable=False)
    faculty = Column(String, nullable=True)
    room = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="timetables")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assignment_type = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    faculty_name = Column(String, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)
    division = Column(String, nullable=True)
    attachment_url = Column(String, nullable=True)
    status = Column(String, default="active")
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="assignments")

class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String, default="Normal")
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    attachment_url = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    published_date = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="notices")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False)
    department = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="events")

class Placement(Base):
    __tablename__ = "placements"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    company_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    package = Column(String, nullable=True)
    drive_date = Column(DateTime(timezone=True), nullable=True)
    eligibility_criteria = Column(Text, nullable=True)
    apply_link = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="placements")

class Scholarship(Base):
    __tablename__ = "scholarships"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    name = Column(String, nullable=False)
    eligibility = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    application_link = Column(String, nullable=True)
    target_department = Column(String, nullable=True)
    target_year = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="scholarships")

class ExamSchedule(Base):
    __tablename__ = "exam_schedules"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    exam_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="exam_schedules")

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)
    search_keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="resources")

class QueryLog(Base):
    __tablename__ = "query_logs"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    query = Column(Text, nullable=False)
    detected_intent = Column(String, nullable=True)
    source_used = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    response_time = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="query_logs")
    student = relationship("Student", back_populates="query_logs")

class NotificationRule(Base):
    __tablename__ = "notification_rules"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    name = Column(String, nullable=False)
    notification_type = Column(String, nullable=False)
    days_before = Column(Integer, nullable=False)
    is_enabled = Column(Boolean, default=True)
    college = relationship("College", back_populates="notification_rules")

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    notification_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    college = relationship("College", back_populates="notification_templates")

class NotificationQueue(Base):
    __tablename__ = "notification_queue"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, processing, completed, failed
    retry_count = Column(Integer, default=0)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="notification_queue")
    student = relationship("Student", back_populates="notification_queue")

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    notification_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False) # sent, failed
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    college = relationship("College", back_populates="notification_logs")
    student = relationship("Student", back_populates="notification_logs")
