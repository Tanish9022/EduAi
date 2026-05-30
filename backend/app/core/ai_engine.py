import os
from app.ai_engine.document_processor import DocumentProcessor
from app.ai_engine.vector_store import VectorStoreManager
from app.ai_engine.query_engine import QueryEngine

doc_processor = None
vector_managers = {}
query_engines = {}

def init_ai_engine():
    global doc_processor
    try:
        if not doc_processor:
            doc_processor = DocumentProcessor()
        print("AI Engine initialized successfully")
    except Exception as e:
        print(f"Error initializing AI engine: {e}")

def get_doc_processor():
    global doc_processor
    return doc_processor

def get_vector_manager(college_id: int):
    global vector_managers
    if college_id not in vector_managers:
        vector_managers[college_id] = VectorStoreManager(college_id=college_id)
    return vector_managers[college_id]

def get_query_engine(college_id: int):
    global query_engines
    if college_id not in query_engines:
        vector_manager = get_vector_manager(college_id)
        query_engines[college_id] = QueryEngine(vector_manager)
    return query_engines[college_id]
