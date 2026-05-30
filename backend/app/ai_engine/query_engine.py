from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from .vector_store import VectorStoreManager
import os
from app.core.config import settings

class QueryEngine:
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.api_key = settings.GEMINI_API_KEY
        self.vector_store_manager = vector_store_manager
        
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2
        )
        
        self.prompt_template = ChatPromptTemplate.from_template("""
        You are the AI brain of Neha, a warm and knowledgeable admission coordinator for MMCC Pune (Marathwada Mitra Mandal's College of Commerce).

        CRITICAL RULES YOU MUST FOLLOW:
        1. NEVER start your response with a greeting (no "Hello", "Namaste", "Hi", "Hey", "Welcome", etc.)
        2. NEVER introduce yourself (no "I'm Neha", "I am the admission coordinator", "I'm your friendly coordinator", etc.)
        3. NEVER say "I'd be happy to help" or "I'm here to help" at the start
        4. The student already knows who you are from the chat UI. Just answer their question DIRECTLY.
        5. Start every response with the actual answer content, not pleasantries.
        6. Use the following retrieved context to answer accurately. If the answer is not in the context, say you don't have that specific information and suggest contacting the admission office at +91-20-25670927 or enquiry@mmcc.edu.in.
        7. Do not make up information. Only use facts from the context.
        8. Be warm and conversational in tone, but get straight to the point.

        Context:
        {context}

        Student's Question:
        {question}

        Answer (start directly with the answer, NO greeting, NO self-introduction):
        """)
        
        self.chain = self.prompt_template | self.llm | StrOutputParser()

    def answer_question(self, question: str) -> str:
        # Retrieve relevant context
        docs = self.vector_store_manager.search(question)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Generate response
        response = self.chain.invoke({
            "context": context,
            "question": question
        })
        
        return response

    def answer_question_with_sources(self, question: str, conversation_history: list = None) -> dict:
        # Retrieve relevant context
        try:
            docs = self.vector_store_manager.search(question)
        except Exception as e:
            print(f"DEBUG: Vector search failed (likely empty Chroma collection): {e}")
            docs = []
            
        context = "\n\n".join([doc.page_content for doc in docs]) if docs else "No context available."
        
        # Format conversation history for context
        history_str = ""
        if conversation_history:
            for turn in conversation_history:
                role = "Student" if turn.get("role") == "user" else "Assistant"
                content = turn.get("content", "")
                history_str += f"{role}: {content}\n"
        
        final_question = question
        if history_str:
            final_question = f"Conversation History:\n{history_str}\nFollow-up Student Question: {question}"

        # Generate response
        response = self.chain.invoke({
            "context": context,
            "question": final_question
        })
        
        # Format sources
        sources = []
        seen = set()
        for doc in docs:
            src = doc.metadata.get("source", "Unknown Document")
            if src not in seen:
                seen.add(src)
                sources.append({
                    "title": src,
                    "snippet": doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content
                })
                
        return {
            "answer": response,
            "sources": sources
        }

    def translate(self, text: str, target_lang: str) -> str:
        prompt = ChatPromptTemplate.from_template("""
        You are a highly accurate translator.
        Translate the following text to {target_lang}.
        Keep the original tone, formatting, markdown/HTML tags, emojis, and structure exactly the same.
        Do NOT write any introduction, greetings, explanation, or additional notes. Only provide the translated text.

        Text to translate:
        {text}

        Translation:
        """)
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke({"text": text, "target_lang": target_lang})
