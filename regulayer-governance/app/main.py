
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import router
from .storage import init_governance_db

app = FastAPI(
    title="Regulayer Governance Service",
    description="Immutable audit trail and decision review workflow",
    version="1.0.0"
)

# CORS
# Currently permissive for internal/demo use
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_governance_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "governance"}

app.include_router(router)
