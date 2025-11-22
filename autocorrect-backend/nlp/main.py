from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from contextlib import asynccontextmanager
import logging

from corrector import Corrector

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global corrector instance
corrector = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown"""
    global corrector
    logger.info("🚀 Loading NLP models...")
    corrector = Corrector()
    logger.info("✅ Models loaded successfully")
    yield
    logger.info("👋 Shutting down NLP service")

# Create FastAPI app
app = FastAPI(
    title="Autocorrect NLP Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class CorrectionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    language: str = Field(default="en", pattern="^[a-z]{2}$")

class Suggestion(BaseModel):
    message: str
    offset: int
    length: int
    replacements: List[str]
    confidence: float

class CorrectionResponse(BaseModel):
    original: str
    corrected: str
    suggestions: List[Suggestion]
    language: str

# Routes
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "models_loaded": corrector is not None
    }

@app.post("/spell", response_model=dict)
async def spell_check(request: CorrectionRequest):
    """Fast spelling correction using SymSpell"""
    if corrector is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        result = corrector.spell_check(request.text)
        return result
    except Exception as e:
        logger.error(f"Spell check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score", response_model=dict)
async def context_score(request: CorrectionRequest):
    """Score text fluency using KenLM"""
    if corrector is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        score = corrector.score_text(request.text)
        return {"text": request.text, "score": score}
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/correct", response_model=CorrectionResponse)
async def correct_text(request: CorrectionRequest):
    """Complete correction pipeline"""
    if corrector is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        result = corrector.correct(request.text, request.language)
        return result
    except Exception as e:
        logger.error(f"Correction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
