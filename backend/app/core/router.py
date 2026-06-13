import json
import re
import time
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings

INTENT_KEYWORDS = {
    "resource": ["resource", "form", "pdf", "download", "syllabus", "notes"],
    "assignment": ["assignment", "submission", "project", "journal", "practical", "homework"],
    "exam": ["exam", "paper", "test", "viva", "midterm", "finals"],
    "notice": ["notice", "announcement", "circular"],
    "placement": ["placement", "job", "company", "drive", "interview", "recruitment"],
    "scholarship": ["scholarship", "freeship", "grant", "concession"],
    "timetable": ["timetable", "schedule", "lecture", "period", "class"],
    "faculty": ["faculty", "teacher", "professor", "hod", "contact", "email"],
    "attendance": ["attendance", "present", "absent", "defaulter", "leave"]
}

FEE_KEYWORDS = ["fee", "fees", "payment", "admission fee", "college fee"]

class SmartRouter:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.0
        )
        self.prompt = ChatPromptTemplate.from_template("""
        You are an intent classification engine for an educational institution. Categorize the student's message into EXACTLY ONE of the following intents:
        'assignment', 'exam', 'notice', 'placement', 'scholarship', 'timetable', 'resource', 'faculty', 'attendance', 'rag_fallback'

        If the user is asking about general admission, college history, courses offered, fees, or anything not explicitly listed, choose 'rag_fallback'.

        Respond with ONLY a valid JSON object in this format (no other text, no markdown block formatting):
        {{"intent": "<chosen_intent>", "confidence": <float between 0 and 1>}}

        Student's Message:
        {message}
        """)
        self.chain = self.prompt | self.llm | StrOutputParser()

    def detect_intent(self, query: str) -> dict:
        start_time = time.time()
        query_lower = query.lower()
        
        # 1. Special Rule for Fees (Bypass everything directly to RAG)
        for fee_word in FEE_KEYWORDS:
            if fee_word in query_lower:
                return {
                    "intent": "rag_fallback", 
                    "confidence": 1.0, 
                    "source": "keyword_match_fees", 
                    "response_time": time.time() - start_time
                }

        # 2. Keyword matching
        for intent, keywords in INTENT_KEYWORDS.items():
            for kw in keywords:
                # Basic token matching to avoid false positives inside bigger words, 
                # but simple `in` works for phrases
                if re.search(r'\b' + re.escape(kw) + r'\b', query_lower):
                    return {
                        "intent": intent, 
                        "confidence": 0.95, 
                        "source": "keyword_match", 
                        "response_time": time.time() - start_time
                    }
                    
        # 3. LLM Fallback (Gemini/Groq Classifier)
        try:
            response_text = self.chain.invoke({"message": query}).strip()
            # Clean up markdown if any
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
                
            parsed = json.loads(response_text)
            intent = parsed.get("intent", "rag_fallback")
            confidence = parsed.get("confidence", 0.5)
            
            # If LLM is uncertain, drop to RAG
            if confidence < 0.6:
                intent = "rag_fallback"
                
            return {
                "intent": intent,
                "confidence": confidence,
                "source": "llm_classifier",
                "response_time": time.time() - start_time
            }
        except Exception as e:
            print(f"Router LLM Error: {e}")
            return {
                "intent": "rag_fallback", 
                "confidence": 0.0, 
                "source": "error_fallback", 
                "response_time": time.time() - start_time
            }
