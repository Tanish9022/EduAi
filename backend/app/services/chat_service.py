import time
from sqlalchemy.orm import Session
from app.models.models import Assignment, Placement, Scholarship, ExamSchedule, Notice, Resource, Timetable, QueryLog, College, Student
from app.core.router import SmartRouter
from app.ai_engine.safety import SafetyFilter
from app.core.ai_engine import get_query_engine

class ChatService:
    def __init__(self):
        self.smart_router = SmartRouter()
        self.safety = SafetyFilter()

    def process_message(
        self, 
        text_body: str, 
        college: College, 
        db: Session, 
        student: Student = None,
        chat_history: list = None
    ) -> str:
        """
        Unified bot logic for WhatsApp and Web Widget.
        Returns the AI response string.
        """
        start_time = time.time()
        
        # 1. Detect Intent
        router_result = self.smart_router.detect_intent(text_body)
        intent = router_result["intent"]
        
        ai_response = ""
        
        # 2. Handle Operational Intents
        if intent == "assignment":
            item = db.query(Assignment).filter(Assignment.college_id == college.id).first()
            ai_response = f"Found assignment: {item.title} (Due: {item.due_date.strftime('%Y-%m-%d')}). Subject: {item.subject}. Status: {item.status}." if item else "No upcoming assignments found."
        elif intent == "placement":
            item = db.query(Placement).filter(Placement.college_id == college.id).first()
            ai_response = f"Upcoming Placement Drive: {item.company_name} for role {item.role}. Package: {item.package}. Apply link: {item.apply_link}." if item else "No upcoming placement drives."
        elif intent == "scholarship":
            item = db.query(Scholarship).filter(Scholarship.college_id == college.id).first()
            ai_response = f"Scholarship available: {item.name}. Deadline: {item.deadline}. Link: {item.application_link}." if item else "No new scholarship notices."
        elif intent == "exam":
            item = db.query(ExamSchedule).filter(ExamSchedule.college_id == college.id).first()
            ai_response = f"Exam Scheduled: {item.exam_name} for subject {item.subject} on {item.date_time.strftime('%Y-%m-%d %H:%M')}." if item else "No upcoming exams scheduled."
        elif intent == "notice":
            item = db.query(Notice).filter(Notice.college_id == college.id).first()
            ai_response = f"Notice [{item.priority}]: {item.title} - {item.content}." if item else "No new notices."
        elif intent == "resource":
            item = db.query(Resource).filter(Resource.college_id == college.id).first()
            ai_response = f"Resource Available: {item.title}. Category: {item.category}. Download: {item.file_url}" if item else "No resources found."
        elif intent == "timetable":
            item = db.query(Timetable).filter(Timetable.college_id == college.id).first()
            ai_response = f"Timetable Entry: {item.subject} by {item.faculty} in room {item.room} at {item.start_time.strftime('%H:%M')}." if item else "No timetable entries found."
        elif intent in ["faculty", "attendance"]:
            ai_response = f"Currently, {intent} records are being updated. Please contact the administration."
        else:
            # 3. Fallback to RAG
            is_safe, reason = self.safety.check_input(text_body)
            if not is_safe:
                ai_response = f"I'm sorry, I cannot process this query: {reason}"
            else:
                query_engine = get_query_engine(college.id)
                if not query_engine:
                    ai_response = "I'm sorry, our system is currently under maintenance. Please try again later."
                else:
                    if chat_history is None:
                        chat_history = []
                    result = query_engine.answer_question_with_sources(text_body, chat_history)
                    ai_response = self.safety.check_output(result["answer"])

        # 4. Log Query
        query_log = QueryLog(
            college_id=college.id,
            student_id=student.id if student else None,
            query=text_body,
            detected_intent=intent,
            source_used=router_result["source"],
            confidence=router_result["confidence"],
            response_time=time.time() - start_time
        )
        db.add(query_log)
        db.commit()

        return ai_response

chat_service = ChatService()
