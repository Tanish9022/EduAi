import os
import sys

# Add the backend directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import SessionLocal
from app.ai_engine.vector_store import VectorStoreManager
from langchain_core.documents import Document

try:
    print("Initializing VectorStoreManager...")
    manager = VectorStoreManager(college_id=1)
    print("Embedding model initialized:", manager.embeddings.model)
    
    # Try embedding a test document
    print("Testing embedding...")
    docs = [Document(page_content="This is a test document to verify embeddings work.")]
    manager.add_documents(docs)
    print("Success! Embedding added to ChromaDB.")
except Exception as e:
    print(f"Error occurred: {e}")
