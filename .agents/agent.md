# EduAI Assist — Agent Instructions

## Who You Are

You are the AI development agent for **EduAI Assist**, an enterprise-grade SaaS platform that automates college admission support using AI chatbots, WhatsApp integration, and document intelligence.

---

## Project Overview

EduAI Assist helps colleges automate repetitive admission queries by:
- Deploying AI chatbots on websites and WhatsApp
- Indexing college documents (PDFs, DOCX) into a vector database
- Answering student questions using RAG-based retrieval
- Providing analytics dashboards for college admins

---

## Tech Stack You Work With

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Vector DB | ChromaDB (dev), Pinecone (prod) |
| AI Models | Gemini, OpenAI GPT |
| AI Framework | LangChain |
| Auth | JWT, bcrypt |
| Storage | AWS S3 |
| Messaging | Meta WhatsApp Business API |
| Deployment | Vercel (frontend), Railway/AWS (backend) |
| Monitoring | Grafana, Prometheus, Sentry |

---

## Active Skills

Load these skills when working on related tasks:

| Skill | Path | When to Use |
|---|---|---|
| Vector Database | `.agents/skills/vector-db/SKILL.md` | Document upload, embedding, RAG pipeline, similarity search |
| Context7 MCP | `.agents/skills/context7-mcp/SKILL.md` | Fetching latest library docs |

---

## Project Documentation

All design docs live in `project-docs/`. Key files:

| File | Purpose |
|---|---|
| `README.md` | Project overview |
| `requirements.md` | Functional + non-functional requirements |
| `architecture.md` | System architecture |
| `api-design.md` | API endpoints |
| `database.md` | DB schema |
| `ai-system.md` | AI pipeline design |
| `rag-pipeline.md` | RAG flow details |
| `authentication.md` | Auth system |
| `whatsapp-integration.md` | WhatsApp setup |
| `frontend.md` | Frontend structure |
| `backend.md` | Backend modules |
| `deployment.md` | Deployment targets |
| `security.md` | Security rules |

---

## Coding Standards

### Python (Backend / AI)
- Use `async/await` for all FastAPI routes
- Pydantic models for all request/response schemas
- Dependency injection for DB sessions and auth
- All secrets via environment variables — never hardcoded
- Type hints on all functions

### TypeScript (Frontend)
- Functional components only
- `use client` directive only when needed
- Tailwind for all styling — no inline styles
- API calls via a centralized `services/` layer

### General
- No hardcoded credentials or API keys
- All multi-tenant queries must include `college_id` filter
- Validate all inputs before processing
- Return consistent error shapes: `{ error: string, code: string }`

---

## Multi-Tenant Rules

- Every database record must have a `college_id` foreign key
- Every API endpoint must validate the requesting tenant
- Vector DB queries must be scoped to the college's namespace/collection
- Never return data from one college to another

---

## Environment Variables

Defined in `project-docs/env.md`. Always reference by key name, never log values:

```
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
GEMINI_API_KEY
WHATSAPP_TOKEN
AWS_ACCESS_KEY
```

---

## Key Workflows

### Document Indexing
1. College admin uploads PDF via dashboard
2. File stored in AWS S3
3. Text extracted → chunked → embedded
4. Vectors upserted to college's namespace in vector DB
5. Document record saved in PostgreSQL

### Student Query (RAG)
1. Student sends message (web chat or WhatsApp)
2. Query embedded using same model as indexing
3. Top-5 similar chunks retrieved from college's namespace
4. Chunks injected into system prompt
5. AI generates grounded response
6. Response returned + logged to `chat_logs`

### WhatsApp Flow
1. Student messages college WhatsApp number
2. Meta webhook fires to `/webhook` endpoint
3. Backend processes message → triggers RAG pipeline
4. AI response sent back via WhatsApp API

---

## What You Should Never Do

- Never expose raw vectors or embeddings in API responses
- Never skip `college_id` scoping in any DB or vector query
- Never use a different embedding model for query vs indexing
- Never store secrets in code or commit `.env` files
- Never return unfiltered database errors to the client
- Never generate responses without retrieved context (pure hallucination)
