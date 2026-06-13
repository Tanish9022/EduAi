import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.models import (
    Student, NotificationRule, NotificationTemplate, NotificationQueue, NotificationLog,
    Assignment, ExamSchedule, Placement, Scholarship, Event
)
from app.services.whatsapp_service import WhatsAppService
from app.core.config import settings
import pytz

class NotificationEngine:
    def __init__(self):
        self.wa_service = WhatsAppService()

    def generate_scheduled_notifications(self):
        """
        Runs every 30 minutes. Evaluates NotificationRules against Operational tables.
        If a rule matches, queue a message for eligible students.
        """
        db: Session = SessionLocal()
        try:
            now = datetime.now(pytz.utc)
            rules = db.query(NotificationRule).filter(NotificationRule.is_enabled == True).all()

            for rule in rules:
                target_date_start = now + timedelta(days=rule.days_before)
                target_date_end = target_date_start + timedelta(days=1)
                
                # Fetch Template
                template = db.query(NotificationTemplate).filter(
                    NotificationTemplate.college_id == rule.college_id,
                    NotificationTemplate.notification_type == rule.notification_type
                ).first()
                
                if not template:
                    continue

                if rule.notification_type == "assignment":
                    items = db.query(Assignment).filter(
                        Assignment.college_id == rule.college_id,
                        Assignment.due_date >= target_date_start,
                        Assignment.due_date < target_date_end
                    ).all()
                    
                    for item in items:
                        self._queue_for_students(db, rule, template, item, "assignments", {"subject": item.subject, "deadline": item.due_date.strftime('%Y-%m-%d')})

                elif rule.notification_type == "exam":
                    items = db.query(ExamSchedule).filter(
                        ExamSchedule.college_id == rule.college_id,
                        ExamSchedule.date_time >= target_date_start,
                        ExamSchedule.date_time < target_date_end
                    ).all()
                    for item in items:
                        self._queue_for_students(db, rule, template, item, "exams", {"subject": item.subject, "date": item.date_time.strftime('%Y-%m-%d'), "time": item.date_time.strftime('%H:%M')})

                elif rule.notification_type == "placement":
                    items = db.query(Placement).filter(
                        Placement.college_id == rule.college_id,
                        Placement.drive_date >= target_date_start,
                        Placement.drive_date < target_date_end
                    ).all()
                    for item in items:
                        self._queue_for_students(db, rule, template, item, "placements", {"company": item.company_name, "role": item.role, "date": item.drive_date.strftime('%Y-%m-%d')})
                        
                elif rule.notification_type == "scholarship":
                    items = db.query(Scholarship).filter(
                        Scholarship.college_id == rule.college_id,
                        Scholarship.deadline >= target_date_start,
                        Scholarship.deadline < target_date_end
                    ).all()
                    for item in items:
                        self._queue_for_students(db, rule, template, item, "scholarships", {"name": item.name, "deadline": item.deadline.strftime('%Y-%m-%d')})

                elif rule.notification_type == "event":
                    items = db.query(Event).filter(
                        Event.college_id == rule.college_id,
                        Event.event_date >= target_date_start,
                        Event.event_date < target_date_end
                    ).all()
                    for item in items:
                        self._queue_for_students(db, rule, template, item, "events", {"title": item.title, "date": item.event_date.strftime('%Y-%m-%d')})

            db.commit()
        except Exception as e:
            print(f"[NotificationEngine] Error generating notifications: {e}")
            db.rollback()
        finally:
            db.close()

    def _queue_for_students(self, db: Session, rule: NotificationRule, template: NotificationTemplate, item, pref_key: str, kwargs: dict):
        """Helper to evaluate student preferences and queue messages."""
        # Find eligible students matching the item's department/year
        query = db.query(Student).filter(Student.college_id == rule.college_id)
        
        if hasattr(item, 'department') and item.department:
            query = query.filter(Student.department == item.department)
        if hasattr(item, 'year') and item.year:
            query = query.filter(Student.year == item.year)
            
        students = query.all()
        
        # Hydrate template
        message_body = template.body
        for k, v in kwargs.items():
            message_body = message_body.replace(f"{{{k}}}", str(v))
            
        full_message = f"{template.title}\n\n{message_body}"

        for student in students:
            # Check preferences
            prefs = student.notification_preferences or {}
            if prefs.get(pref_key, True) == False:
                continue
                
            # Avoid duplicate queueing
            existing = db.query(NotificationQueue).filter(
                NotificationQueue.student_id == student.id,
                NotificationQueue.message == full_message
            ).first()
            if existing:
                continue
                
            # Queue the message
            queue_item = NotificationQueue(
                college_id=rule.college_id,
                student_id=student.id,
                message=full_message,
                notification_type=rule.notification_type,
                status="pending"
            )
            db.add(queue_item)

    def queue_instant_notification(self, college_id: int, notification_type: str, title: str, body: str, item=None):
        """
        Bypasses 30m wait. Immediately queues a notification.
        Example: Emergency Notice, Holiday.
        """
        db: Session = SessionLocal()
        try:
            query = db.query(Student).filter(Student.college_id == college_id)
            
            # If the notice was targeted (e.g. specific department)
            if item and hasattr(item, 'target_audience') and item.target_audience and item.target_audience != "All":
                query = query.filter(Student.department == item.target_audience)
                
            students = query.all()
            full_message = f"🚨 {title}\n\n{body}"

            for student in students:
                queue_item = NotificationQueue(
                    college_id=college_id,
                    student_id=student.id,
                    message=full_message,
                    notification_type=notification_type,
                    status="pending"
                )
                db.add(queue_item)
            db.commit()
        except Exception as e:
            print(f"[NotificationEngine] Error queuing instant notification: {e}")
            db.rollback()
        finally:
            db.close()

    async def process_notification_queue(self):
        """
        Runs every 1 minute.
        Picks up to 50 pending items, sends them via WhatsApp API, updates Queue and Log.
        """
        db: Session = SessionLocal()
        try:
            # Lock rows to prevent concurrent processing (SKIP LOCKED conceptually, just grab top 50 pending)
            items = db.query(NotificationQueue).filter(
                NotificationQueue.status == "pending"
            ).order_by(NotificationQueue.created_at.asc()).limit(50).all()

            if not items:
                return

            # Mark as processing
            for item in items:
                item.status = "processing"
            db.commit()

            for item in items:
                student = db.query(Student).filter(Student.id == item.student_id).first()
                if not student:
                    item.status = "failed"
                    item.processed_at = func.now()
                    continue

                # Rate limit protection: Prevent more than 1 notification per hour per student if needed
                # (Skipping for immediate notices, but good safety net)
                
                # Send via WhatsApp (assuming we have wa_business_phone_number_id globally or in college)
                college = item.college
                phone_id = college.wa_phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
                
                success = await self.wa_service.send_text_message(student.phone_number, item.message, phone_id)
                
                if success:
                    item.status = "completed"
                    item.processed_at = func.now()
                    student.last_notification_sent = func.now()
                    
                    # Log success
                    log = NotificationLog(
                        college_id=item.college_id,
                        student_id=item.student_id,
                        notification_type=item.notification_type,
                        message=item.message,
                        status="sent"
                    )
                    db.add(log)
                else:
                    item.retry_count += 1
                    if item.retry_count >= 3:
                        item.status = "failed"
                        item.processed_at = func.now()
                        log = NotificationLog(
                            college_id=item.college_id,
                            student_id=item.student_id,
                            notification_type=item.notification_type,
                            message=item.message,
                            status="failed"
                        )
                        db.add(log)
                    else:
                        item.status = "pending" # Re-queue for next minute
                        
            db.commit()
            
        except Exception as e:
            print(f"[NotificationProcessor] Error processing queue: {e}")
            db.rollback()
        finally:
            db.close()

notification_engine = NotificationEngine()
