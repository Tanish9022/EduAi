from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from typing import List
import os
from app.core.config import settings

class VectorStoreManager:
    def __init__(self, college_id: int):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in settings")
            
        print(f"DEBUG: VectorStoreManager using key starting with {self.api_key[:5]}... (length: {len(self.api_key)})")
            
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=self.api_key
        )
        
        # In a real Docker setup, persistent_path would be shared
        # For now, we'll store it in a local directory in the backend
        self.persist_directory = "./chroma_db"
        
        collection_name = f"college_{college_id}"
        self.vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory
        )

    def add_documents(self, documents: List[Document]):
        """Adds documents to the vector store."""
        if documents:
            self.vector_store.add_documents(documents)

    def search(self, query: str, k: int = 4) -> List[Document]:
        """Performs similarity search."""
        return self.vector_store.similarity_search(query, k=k)

    def delete_documents(self, filename: str):
        """Removes all documents associated with a specific filename."""
        # Chroma with LangChain doesn't have a direct "delete by metadata" in all versions
        # But we can get IDs and then delete
        results = self.vector_store.get(where={"source": filename})
        ids = results.get("ids", [])
        if ids:
            self.vector_store.delete(ids=ids)
            return len(ids)
        return 0
