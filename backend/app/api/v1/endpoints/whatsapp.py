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

from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.whatsapp_service import whatsapp_service
from app.core.config import settings
from app.api import deps
from app.models.models import User
from pydantic import BaseModel
from typing import List

router = APIRouter()

class BroadcastRequest(BaseModel):
    college_id: int
    message: str
    phone_numbers: List[str]

@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    Handles Meta's webhook verification challenge handshake.
    """
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        print("WEBHOOK_VERIFIED")
        try:
            return int(challenge)
        except ValueError:
            return challenge
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/webhook")
async def handle_whatsapp_message(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Receives incoming text WhatsApp messages from Meta.
    """
    payload = await request.json()
    result = await whatsapp_service.process_webhook(payload, db)
    return result

@router.post("/broadcast")
async def send_broadcast(
    request: BroadcastRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_college_admin),
    db: Session = Depends(get_db)
):
    """
    Queues a background task to broadcast template alerts to multiple phone numbers.
    Restricted to super_admin or college_admin roles via JWT middleware.
    """
    # Enforce tenant scoping: college admins can only broadcast to their own college
    if current_user.role == "college_admin" and current_user.college_id != request.college_id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to send broadcasts for this college"
        )

    # Queue sending process to release API response instantly
    background_tasks.add_task(
        whatsapp_service.send_broadcast_async,
        request.college_id,
        request.message,
        request.phone_numbers,
        db
    )
    
    return {
        "status": "success",
        "message": f"Broadcast of {len(request.phone_numbers)} messages queued successfully"
    }
