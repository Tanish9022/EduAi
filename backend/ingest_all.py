import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Add the backend directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import SessionLocal
from app.models.models import College
from app.ai_engine.document_processor import DocumentProcessor
from app.ai_engine.vector_store import VectorStoreManager

def ingest_all():
    db = SessionLocal()
    try:
        college = db.query(College).filter(College.slug == "mmcc").first()
        if not college:
            print("Error: MMCC college not found in database.")
            return
        
        print(f"Ingesting documents for MMCC (ID: {college.id})...")
        doc_processor = DocumentProcessor()
        vector_manager = VectorStoreManager(college_id=college.id)
        
        storage_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
        print(f"Reading files from: {storage_dir}")
        
        if not os.path.exists(storage_dir):
            print("Storage directory does not exist.")
            return
            
        for filename in os.listdir(storage_dir):
            if filename == ".gitkeep":
                continue
                
            file_path = os.path.join(storage_dir, filename)
            if os.path.isfile(file_path):
                print(f"Processing: {filename}...")
                try:
                    # Delete existing to prevent duplicate embeddings
                    vector_manager.delete_documents(filename)
                    chunks = doc_processor.process_file(file_path)
                    if chunks:
                        vector_manager.add_documents(chunks)
                        print(f"Successfully ingested {len(chunks)} chunks for {filename}")
                    else:
                        print(f"No chunks extracted from {filename}")
                except Exception as ex:
                    print(f"Failed to ingest {filename}: {ex}")
                    
    finally:
        db.close()

if __name__ == "__main__":
    ingest_all()
