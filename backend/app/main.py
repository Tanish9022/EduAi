from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

from app.core.ai_engine import init_ai_engine

# Initialize AI Engine on startup
@app.on_event("startup")
async def startup_event():
    init_ai_engine()

@app.get("/")
async def root():
    return {"message": "Welcome to EduAI Assist API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
