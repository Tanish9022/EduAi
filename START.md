# Getting Started with EduAI Assist

Follow these steps to run the EduAI Assist SaaS platform locally.

## Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL (or use Docker)
- Gemini API Key (from Google AI Studio)

## 1. Environment Setup
Create a `.env` file in the root directory by copying the example:
```bash
cp .env.example .env
```
Update the `GEMINI_API_KEY` in the `.env` file.

## 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### Apply Database Migrations
Ensure your PostgreSQL is running, then:
```bash
cd backend
# Update alembic.ini with your local connection string if not using Docker
alembic upgrade head
```

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Dashboard will be available at `http://localhost:3000`.

## 4. Initial Testing Flow
1. **Register:** Go to `http://localhost:3000/register` to create your first college account.
2. **Login:** Log in at `http://localhost:3000/login`.
3. **Ingest:** Go to the **Documents** tab and trigger an ingest for `admission_info.txt`.
4. **Chat:** Go to the **Chat Monitor** tab and start talking to your AI!

## Docker (Alternative)
If you have Docker installed:
```bash
docker-compose up --build
```
