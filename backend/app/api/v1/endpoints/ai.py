from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import shutil
import time
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api import deps
from app.models.models import User, ChatLog, College, Enquiry
from app.schemas.schemas import EnquiryCreate, EnquiryResponse
from app.ai_engine.document_processor import DocumentProcessor
from app.ai_engine.vector_store import VectorStoreManager
from app.ai_engine.query_engine import QueryEngine
from app.ai_engine.safety import SafetyFilter

from app.core.ai_engine import get_query_engine, get_doc_processor, get_vector_manager

router = APIRouter()

# Storage directory at project root
STORAGE_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", "storage"))
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class PublicChatRequest(BaseModel):
    college_slug: str
    message: Optional[str] = None
    question: Optional[str] = None
    conversation_history: Optional[List[dict]] = []
    language: Optional[str] = "english"

class IngestRequest(BaseModel):
    filename: str

class DocumentResponse(BaseModel):
    name: str
    size: str
    date: str
    status: str

@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    query = request.question or request.message
    if not query:
        raise HTTPException(status_code=400, detail="Either 'question' or 'message' field is required")

    # Safety Check
    safety = SafetyFilter()
    is_safe, reason = safety.check_input(query)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)

    query_engine = get_query_engine(current_user.college_id)
    if not query_engine:
        raise HTTPException(status_code=503, detail="AI Engine not initialized")
    try:
        start_time = time.time()
        result = query_engine.answer_question_with_sources(query, request.conversation_history)
        answer = safety.check_output(result["answer"])
        response_time_ms = int((time.time() - start_time) * 1000)

        # Log to DB
        chat_log = ChatLog(
            college_id=current_user.college_id,
            user_query=query,
            ai_response=answer,
            response_time=response_time_ms,
            channel="web"
        )
        db.add(chat_log)
        db.commit()

        return {
            "answer": answer,
            "sources": result["sources"],
            "college_id": current_user.college_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/public-chat")
async def public_chat(
    request: PublicChatRequest,
    db: Session = Depends(get_db)
):
    query = request.question or request.message
    if not query:
        raise HTTPException(status_code=400, detail="Either 'question' or 'message' field is required")

    # Safety Check
    safety = SafetyFilter()
    is_safe, reason = safety.check_input(query)
    if not is_safe:
        raise HTTPException(status_code=400, detail=reason)

    # Get college by slug
    college = db.query(College).filter(College.slug == request.college_slug).first()
    if not college:
        raise HTTPException(status_code=404, detail=f"College '{request.college_slug}' not found")

    query_engine = get_query_engine(college.id)
    if not query_engine:
        raise HTTPException(status_code=503, detail="AI Engine not initialized")
    try:
        start_time = time.time()
        
        # Prepend translation instruction to LLM query if language is specified
        llm_query = query
        if request.language:
            llm_query = f"IMPORTANT: Please respond to this question completely in the {request.language} language. Keep the tone friendly and natural as an admissions officer.\n\n{query}"
            
        result = query_engine.answer_question_with_sources(llm_query, request.conversation_history)
        answer = safety.check_output(result["answer"])
        response_time_ms = int((time.time() - start_time) * 1000)

        # Log to DB
        chat_log = ChatLog(
            college_id=college.id,
            user_query=query,
            ai_response=answer,
            response_time=response_time_ms,
            channel="web_public"
        )
        db.add(chat_log)
        db.commit()

        return {
            "answer": answer,
            "sources": result["sources"],
            "college_id": college.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class TranslateRequest(BaseModel):
    text: str
    target_language: str
    college_slug: Optional[str] = "mmcc"

@router.post("/translate")
async def translate_text(
    request: TranslateRequest,
    db: Session = Depends(get_db)
):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text to translate is required")
        
    college = db.query(College).filter(College.slug == request.college_slug).first()
    if not college:
        raise HTTPException(status_code=404, detail=f"College '{request.college_slug}' not found")
        
    query_engine = get_query_engine(college.id)
    if not query_engine:
        raise HTTPException(status_code=503, detail="AI Engine not initialized")
        
    try:
        translated = query_engine.translate(request.text, request.target_language)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    """Uploads a file, saves it to storage, and ingests it into the vector store."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".txt", ".pdf", ".docx", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")
    file.file.seek(0)

    file_path = os.path.join(STORAGE_DIR, file.filename)
    
    try:
        # Save file to storage
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Ingest into AI
        doc_processor = get_doc_processor()
        vector_manager = get_vector_manager(current_user.college_id)
        
        chunks = doc_processor.process_file(file_path)
        vector_manager.add_documents(chunks)
        
        return {
            "message": f"Successfully uploaded and ingested {len(chunks)} chunks",
            "filename": file.filename,
            "chunks": len(chunks)
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload/Ingest failed: {str(e)}")

@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    """Lists all documents in the storage directory."""
    documents = []
    if not os.path.exists(STORAGE_DIR):
        return documents

    for filename in os.listdir(STORAGE_DIR):
        if filename == ".gitkeep":
            continue
            
        file_path = os.path.join(STORAGE_DIR, filename)
        stats = os.stat(file_path)
        
        # Format size
        size_bytes = stats.st_size
        if size_bytes < 1024:
            size = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            size = f"{size_bytes / 1024:.1f} KB"
        else:
            size = f"{size_bytes / (1024 * 1024):.1f} MB"
            
        documents.append({
            "name": filename,
            "size": size,
            "date": datetime.fromtimestamp(stats.st_mtime).strftime("%d %b %Y"),
            "status": "indexed"
        })
    
    return documents

@router.delete("/documents/{filename}")
async def delete_document(
    filename: str,
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    """Deletes a document from storage and its vectors from ChromaDB."""
    file_path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        vector_manager = get_vector_manager(current_user.college_id)
        deleted_count = vector_manager.delete_documents(filename)
        
        os.remove(file_path)
        
        return {"message": f"Successfully deleted {filename} and {deleted_count} vector chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

@router.post("/ingest")
async def ingest_document(
    request: IngestRequest,
    current_user: User = Depends(deps.get_current_active_college_admin)
):
    doc_processor = get_doc_processor()
    vector_manager = get_vector_manager(current_user.college_id)
    
    if not doc_processor or not vector_manager:
        raise HTTPException(status_code=503, detail="AI Engine not initialized")
    
    file_path = os.path.join(STORAGE_DIR, request.filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File {request.filename} not found in storage")
        
    try:
        chunks = doc_processor.process_file(file_path)
        vector_manager.add_documents(chunks)
        return {"message": f"Successfully ingested {len(chunks)} chunks for college {current_user.college_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history")
async def get_chat_history(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(ChatLog).filter(ChatLog.college_id == current_user.college_id).order_by(ChatLog.created_at.desc()).limit(50).all()
    return [{"id": l.id, "user_message": l.user_query, "ai_response": l.ai_response, "response_time_ms": l.response_time, "created_at": l.created_at, "channel": l.channel} for l in logs]

@router.post("/enquiries", response_model=EnquiryResponse)
async def create_enquiry(
    request: EnquiryCreate,
    db: Session = Depends(get_db)
):
    college = db.query(College).filter(College.slug == request.college_slug).first()
    if not college:
        raise HTTPException(status_code=404, detail=f"College '{request.college_slug}' not found")

    enquiry = Enquiry(
        college_id=college.id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        course=request.course
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry

@router.get("/enquiries", response_model=List[EnquiryResponse])
async def list_enquiries(
    current_user: User = Depends(deps.get_current_active_college_admin),
    db: Session = Depends(get_db)
):
    enquiries = db.query(Enquiry).filter(Enquiry.college_id == current_user.college_id).order_by(Enquiry.created_at.desc()).all()
    return enquiries
