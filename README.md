# EduAI Assist - Multilingual College Admission RAG Platform

EduAI Assist is an intelligent, full-stack, multilingual RAG (Retrieval-Augmented Generation) chatbot platform designed to streamline college admissions. It allows colleges to ingest their own admission guidelines, criteria, and fee structures, offering prospective students instant support in English, Marathi, and Hindi, along with direct WhatsApp integrations for final-mile enrollment.

## 🚀 Key Features

- **Multilingual Support**: Header language selection and per-message translations across English, Marathi (मराठी), and Hindi (हिंदी).
- **RAG Admissions Brain**: Connects Gemini and Groq (Llama-3.1) to local SQLite/Chroma vector DB to offer accurate replies based solely on official documents.
- **Smart Lead & Fee Capture**: Triggerable WhatsApp-integration forms that gather student details when deep fee structures are requested, immediately routing them to human counselors.
- **Admin Dashboard**: Custom college registration, document indexing and deletion, real-time enquiry monitoring, and AI logs.
- **Robust Tech Stack**: Built with FastAPI (Python) backend, Next.js (React/TypeScript) frontend, PostgreSQL database, and ChromaDB vector store.

---

## 🛠️ Prerequisites

- **Python**: 3.12+
- **Node.js**: 20+
- **PostgreSQL**: (or run via Docker Compose)
- **API Keys**: Gemini API Key (Google AI Studio) and Groq API Key (Groq Console).

---

## 📂 Project Structure

```text
├── backend/          # FastAPI App (API Endpoints, RAG Engine, DB Migrations)
├── frontend/         # Next.js Dashboard & Chatbot Interface
├── storage/          # Local file upload directory for document indexing
├── docker-compose.yml# Docker setup for local deployment
└── README.md         # Documentation
```

---

## 💻 Local Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Update your database configuration and API keys:
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `DATABASE_URL` (PostgreSQL connection string)

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Run Migrations
alembic upgrade head

# Start Development Server
uvicorn app.main:app --reload
```
The backend API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to view the application dashboard.

---

## 🐳 Docker Deployment (Alternative)
To spin up all services (Next.js, FastAPI, Postgres, and ChromaDB) together:
```bash
docker-compose up --build
```

---

## 📝 Demo / Flow Setup
1. **Register**: Navigate to `http://localhost:3000/register` to register your college.
2. **Upload Documents**: Log in, navigate to **Documents**, and upload/ingest your admissions files (e.g. `admission_info.txt`).
3. **Engage**: Visit the chatbot widget or chat window to test live query answering.
