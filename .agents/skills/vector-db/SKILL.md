# Vector Database Skill

## Purpose
This skill gives the agent deep understanding of vector database concepts, embedding pipelines, and RAG (Retrieval-Augmented Generation) architecture used in the EduAI Assist platform.

---

## Core Vocabulary

| Term | Meaning |
|---|---|
| Vector | A numerical array representing the semantic meaning of a text chunk |
| Embedding | The process of converting text into a vector using an AI model |
| Chunk | A small piece of a document (typically 200–500 tokens) used for embedding |
| Similarity Search | Finding vectors closest to a query vector using cosine or dot-product distance |
| RAG | Retrieval-Augmented Generation — injecting retrieved context into an AI prompt |
| Vector DB | A database optimized for storing and querying high-dimensional vectors |
| Namespace | A logical partition inside a vector DB to isolate data per tenant/college |
| Upsert | Insert or update a vector record in the database |
| Top-K | The number of most relevant chunks to retrieve per query |
| Context Window | The maximum token limit an AI model can process in one prompt |
| Hallucination | When an AI generates false information not grounded in source documents |
| Metadata | Extra fields stored alongside a vector (e.g., college_id, doc_name, page_number) |

---

## Supported Vector Databases

### Development
- **ChromaDB** — local, zero-config, ideal for dev/testing

### Production
- **Pinecone** — managed, scalable, fast
- **Weaviate** — open-source, supports hybrid search
- **Qdrant** — high-performance, self-hostable

---

## Embedding Models

| Model | Provider | Dimensions |
|---|---|---|
| text-embedding-004 | Google Gemini | 768 |
| text-embedding-3-small | OpenAI | 1536 |
| text-embedding-3-large | OpenAI | 3072 |

---

## Document Processing Pipeline

```
PDF / DOCX / TXT Upload
↓
Text Extraction (PyMuPDF / python-docx)
↓
Cleaning (remove headers, footers, noise)
↓
Chunking (RecursiveCharacterTextSplitter, 400 tokens, 50 overlap)
↓
Embedding Generation (Gemini / OpenAI)
↓
Upsert to Vector DB (with metadata: college_id, doc_id, chunk_index)
```

---

## Query Pipeline

```
Student Query
↓
Embed Query (same model used during indexing)
↓
Similarity Search (Top-K = 5)
↓
Retrieve Chunks + Metadata
↓
Build Prompt with Context
↓
Send to AI Model (Gemini / GPT)
↓
Return Grounded Response
```

---

## Chunking Strategy

- Chunk size: 400 tokens
- Overlap: 50 tokens
- Splitter: `RecursiveCharacterTextSplitter` (LangChain)
- Preserve sentence boundaries where possible

---

## Metadata Schema

Each vector stored includes:

```json
{
  "college_id": "uuid",
  "document_id": "uuid",
  "chunk_index": 0,
  "source_file": "admission_guide_2025.pdf",
  "page_number": 3,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## Multi-Tenant Isolation

- Each college gets its own **namespace** (Pinecone) or **collection** (ChromaDB)
- Queries are always scoped to the requesting college's namespace
- No cross-tenant data leakage

---

## Tech Stack

| Component | Technology |
|---|---|
| Embedding Model | Gemini text-embedding-004 |
| Vector DB (dev) | ChromaDB |
| Vector DB (prod) | Pinecone |
| Framework | LangChain |
| Backend | FastAPI |
| File Storage | AWS S3 |
| Text Extraction | PyMuPDF, python-docx |

---

## Key Rules for the Agent

1. Always use the **same embedding model** for indexing and querying
2. Always **filter by college_id** when performing similarity search
3. Chunk documents **before** generating embeddings — never embed full documents
4. Store **metadata** with every vector for traceability
5. Use **Top-K = 5** as default; increase only if context window allows
6. Never expose raw vectors in API responses
7. Re-index documents when the embedding model changes
