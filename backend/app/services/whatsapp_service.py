"""
================================================================================
META WHATSAPP BUSINESS CLOUD API INTEGRATION SETUP INSTRUCTIONS
================================================================================

1. HOW TO CREATE A META APP AND GET CREDENTIALS:
   - Register on Meta for Developers: https://developers.facebook.com/
   - Click "Create App" -> Select "Other" -> Select "Business" app type.
   - Add the "WhatsApp" product to your App.
   - Go to WhatsApp -> "API Setup" in the dashboard.
   - Under "Step 1: Send and receive messages", you will find:
     * Temporary Access Token (expires in 24h, replace with a Permanent System User Token in production)
     * Phone Number ID (e.g. 1092837262...)
     * WhatsApp Business Account ID
   - Put these details into your .env:
     * WHATSAPP_ACCESS_TOKEN=<your_access_token>
     * WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
     * WHATSAPP_TEMPLATE_NAME=<approved_template_name> (defaults to hello_world)

2. HOW TO REGISTER THE WEBHOOK URL IN META DASHBOARD:
   - Go to WhatsApp -> "Configuration" in the Meta Developer Console.
   - Click "Edit" under Webhooks.
   - Set Callback URL to: https://<your_subdomain>.ngrok-free.app/api/v1/whatsapp/webhook
   - Set Verify Token to match WHATSAPP_VERIFY_TOKEN in your .env (e.g. eduai_secret_token).
   - Click "Verify and save".
   - Locate "Webhook fields" and click "Subscribe" on the "messages" field.

3. HOW TO GET A WHATSAPP TEMPLATE APPROVED:
   - Navigate to WhatsApp Manager -> Message Templates (inside Meta Business Suite).
   - Click "Create Template", select Category (e.g., Utility) and name it (e.g. admission_alert).
   - Write body content using parameters. E.g.:
     "Hello! Here is an update on your admission status: {{1}}"
   - Submit for approval. Meta's review is automated and typically takes minutes.
   - Copy this approved template name to WHATSAPP_TEMPLATE_NAME in your environment.

4. HOW TO EXPOSE LOCALHOST FOR TESTING (NGROK):
   - Expose the FastAPI backend port 8000 using Ngrok:
     ngrok http 8000
   - Copy the generated HTTPS ngrok URL and register it as your Callback URL in the Meta Dashboard.
================================================================================
"""

import time
import asyncio
import httpx
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.models import ChatLog, College, Broadcast, Student, Assignment, Notice, Placement, Scholarship, ExamSchedule, Resource, Timetable, QueryLog
from app.core.router import SmartRouter
from app.core.ai_engine import get_query_engine
from app.core.config import settings
from app.ai_engine.safety import SafetyFilter

class MemoryHistoryManager:
    """Manages chat history per user phone number with a 30-minute TTL."""
    def __init__(self, ttl_seconds: int = 1800):
        self.ttl = ttl_seconds
        self.sessions = {} # { phone_number: { "last_active": float, "history": [...] } }

    def get_history(self, phone_number: str) -> List[Dict[str, str]]:
        now = time.time()
        if phone_number in self.sessions:
            session = self.sessions[phone_number]
            if now - session["last_active"] < self.ttl:
                session["last_active"] = now
                return session["history"]
        # Expired or new session
        self.sessions[phone_number] = {
            "last_active": now,
            "history": []
        }
        return self.sessions[phone_number]["history"]

    def add_message(self, phone_number: str, role: str, content: str):
        history = self.get_history(phone_number)
        history.append({"role": role, "content": content})
        if len(history) > 20: # Limit memory footprint
            history.pop(0)

# Global session/history manager
chat_history_manager = MemoryHistoryManager()

class WhatsAppService:
    async def send_text_message(self, to: str, message: str, phone_number_id: str) -> bool:
        """Sends a text reply via Meta's WhatsApp Business Cloud API."""
        if not settings.WHATSAPP_TOKEN:
            print("[WhatsAppService] WHATSAPP_ACCESS_TOKEN not configured. Skipping send.")
            return False

        url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"body": message}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()
                return True
            except Exception as e:
                print(f"[WhatsAppService] Failed to send message to {to}: {e}")
                return False

    async def send_template_message(self, to: str, parameter_text: str, phone_number_id: str) -> bool:
        """Sends a structured template message via Meta's WhatsApp API for broadcasts."""
        if not settings.WHATSAPP_TOKEN or not settings.WHATSAPP_TEMPLATE_NAME:
            print("[WhatsAppService] WhatsApp credentials or template name not configured.")
            return False

        url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "template",
            "template": {
                "name": settings.WHATSAPP_TEMPLATE_NAME,
                "language": {
                    "code": "en"
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": parameter_text
                            }
                        ]
                    }
                ]
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()
                return True
            except Exception as e:
                print(f"[WhatsAppService] Failed to send template message to {to}: {e}")
                return False

    async def process_webhook(self, payload: dict, db: Session) -> dict:
        """
        Decodes incoming Webhook message payloads from Meta.
        Maps the sender's phone_number_id to College settings, invokes RAG,
        transmits the reply, and registers logs.
        """
        try:
            entry = payload.get("entry", [{}])[0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])
            metadata = value.get("metadata", {})
            
            if not messages:
                return {"status": "ignored", "reason": "No messages array"}
                
            message = messages[0]
            from_number = message.get("from")
            wa_business_phone_number_id = metadata.get("phone_number_id")
            message_type = message.get("type")

            if message_type != "text" or not from_number or not wa_business_phone_number_id:
                return {"status": "ignored", "reason": "Unsupported message type or missing parameters"}
                
            text_body = message.get("text", {}).get("body", "").strip()
            if not text_body:
                return {"status": "ignored", "reason": "Empty message body"}

            college = db.query(College).filter(College.wa_phone_number_id == wa_business_phone_number_id).first()
            if not college:
                print(f"[WhatsAppService] College not found for phone_number_id: {wa_business_phone_number_id}")
                return {"status": "error", "reason": "College mapping not found"}

            # Student Onboarding Flow
            student = db.query(Student).filter(Student.phone_number == from_number).first()
            
            if not student:
                student = Student(
                    college_id=college.id,
                    phone_number=from_number
                )
                db.add(student)
                db.commit()
                ai_response = "Welcome to EduAI! To serve you better, please reply with your Department (e.g., Computer Science, IT, etc.)."
                await self.send_text_message(from_number, ai_response, wa_business_phone_number_id)
                return {"status": "onboarding_step_1"}
            
            if not student.department:
                student.department = text_body
                db.commit()
                ai_response = "Great! Now, what is your Year? (e.g., FY, SY, TY, etc.)"
                await self.send_text_message(from_number, ai_response, wa_business_phone_number_id)
                return {"status": "onboarding_step_2"}
                
            if not student.year:
                student.year = text_body
                db.commit()
                ai_response = "Got it. Finally, what is your Division? (e.g., A, B, C)"
                await self.send_text_message(from_number, ai_response, wa_business_phone_number_id)
                return {"status": "onboarding_step_3"}
                
            if not student.division:
                student.division = text_body
                db.commit()
                ai_response = "Thanks! Your profile is complete. How can I help you today?"
                await self.send_text_message(from_number, ai_response, wa_business_phone_number_id)
                return {"status": "onboarding_complete"}

            # Smart Router implementation via Unified Chat Service
            from app.services.chat_service import chat_service
            
            start_time = time.time()
            history = chat_history_manager.get_history(from_number)
            
            ai_response = chat_service.process_message(
                text_body=text_body,
                college=college,
                db=db,
                student=student,
                chat_history=history
            )

            response_time_ms = int((time.time() - start_time) * 1000)

            # Update memory history
            chat_history_manager.add_message(from_number, "user", text_body)
            chat_history_manager.add_message(from_number, "assistant", ai_response)

            # Log exchange to ChatLog DB with channel = "whatsapp"
            chat_log = ChatLog(
                college_id=college.id,
                user_query=text_body,
                ai_response=ai_response,
                response_time=response_time_ms,
                channel="whatsapp"
            )
            db.add(chat_log)
            db.commit()

            # Dispatch reply via Meta Graph API
            sent = await self.send_text_message(from_number, ai_response, wa_business_phone_number_id)

            return {
                "status": "success" if sent else "failed_send",
                "from": from_number,
                "college_id": college.id,
                "response_time_ms": response_time_ms
            }

        except Exception as e:
            db.rollback()
            print(f"[WhatsAppService] Error processing webhook: {e}")
            return {"status": "error", "message": str(e)}

    async def send_broadcast_async(self, college_id: int, message: str, phone_numbers: List[str], db: Session):
        """
        Background task to send templates to numbers sequentially.
        Rate-limited to 10 messages/second to stay within Meta's limits.
        """
        # Fetch college details to extract configured wa_phone_number_id
        college = db.query(College).filter(College.id == college_id).first()
        phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        
        # Override with college's specific phone number ID if saved
        if college and college.wa_phone_number_id:
            phone_number_id = college.wa_phone_number_id

        if not phone_number_id:
            print(f"[WhatsAppService] No sender phone_number_id configured for college {college_id}")
            return

        for idx, phone in enumerate(phone_numbers):
            # Enforce 10 messages/second limit (100ms sleep between sends)
            if idx > 0:
                await asyncio.sleep(0.1)

            success = await self.send_template_message(phone, message, phone_number_id)
            
            # Log results in db
            try:
                broadcast_log = Broadcast(
                    college_id=college_id,
                    message=message,
                    phone_number=phone,
                    status="sent" if success else "failed"
                )
                db.add(broadcast_log)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"[WhatsAppService] Failed to log broadcast status for {phone}: {e}")

whatsapp_service = WhatsAppService()
