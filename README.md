# EduAI Assist - Intelligent Student Engagement & Admission Platform

EduAI Assist is an intelligent, full-stack platform designed for colleges. It transcends a traditional admission chatbot by combining a **Multilingual RAG Brain** with a **Proactive Notification Engine**, seamlessly operating across both a **Website Widget** and **WhatsApp**.

## 🚀 Key Features

- **Unified Smart Router**: Intelligently routes student queries using keyword matching for structured data (Assignments, Exams, Notices) and falls back to a Gemini-powered RAG Engine for complex unstructured data (Prospectus, Fee Structures).
- **Proactive Notification Engine**: Driven by APScheduler, the system monitors operational databases and automatically dispatches customized WhatsApp template reminders for upcoming deadlines (Assignments, Placements, Exams).
- **Student-Centric Preferences**: Students can opt-in or opt-out of specific notification categories (e.g., enable Scholarships, disable Events) directly via the WhatsApp onboarding flow.
- **Robust Multi-Tenancy**: Built from day one to support multiple colleges. Every record—from documents to analytics—is securely scoped to a specific `college_id`.
- **Advanced Admin Dashboard**: 
  - Manage Operational DBs (Notices, Events, Timetables).
  - Track Notification Queue, Logs, and Analytics.
  - Ingest documents dynamically into the AI Knowledge Base.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy, APScheduler
- **AI & RAG**: Google Gemini API, LlamaIndex, PGVector / ChromaDB
- **Frontend**: Next.js (React/TypeScript), Tailwind CSS
- **Database**: PostgreSQL
- **Integrations**: WhatsApp Cloud API Webhooks

---

## 📂 Project Structure

```text
├── backend/
│   ├── alembic/       # DB Migration Revisions
│   ├── app/
│   │   ├── api/       # API Endpoints (Notices, Auth, Webhooks)
│   │   ├── core/      # Smart Router, Limiter, Config
│   │   ├── jobs/      # APScheduler definitions
│   │   ├── models/    # SQLAlchemy Models
│   │   └── services/  # ChatService (Unified Bot) & NotificationEngine
│   └── main.py        # FastAPI App Entrypoint
├── frontend/
│   ├── public/        # Static assets (including iframe-ready widget.html)
│   └── src/           # Next.js App Router Pages
├── storage/           # Local file upload directory for document indexing
└── docker-compose.yml # Docker setup for local deployment
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
- `DATABASE_URL` (PostgreSQL connection string)
- `WHATSAPP_TOKEN` & `WHATSAPP_VERIFY_TOKEN` (Meta Developer Console)

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

# Start Development Server (Includes Notification Engine)
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
To spin up all services together:
```bash
docker-compose up --build
```

---

## 📝 Usage Flow

1. **Register**: Navigate to `http://localhost:3000/register` to register your college and access the admin dashboard.
2. **Onboard Students**: Students interact via WhatsApp. The bot dynamically collects their Department, Year, and Division, storing them in the system.
3. **Automate Engagement**: Admin creates an Assignment or Exam schedule in the dashboard. The `NotificationEngine` automatically processes the rule, evaluates eligible students, queues the payloads, and dispatches WhatsApp templates based on delivery schedules.
4. **Instant Broadcasting**: "High Priority" notices instantly bypass scheduled queues and are pushed directly to targeted students.
