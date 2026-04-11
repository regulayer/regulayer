
from fastapi import FastAPI
from .config import settings
from .api import router
from .storage import init_governance_db

app = FastAPI(
    title="Regulayer Governance Service",
    description="Immutable audit trail and decision review workflow",
    version="1.0.0"
)

# NOTE: No CORS middleware here. The gateway is the sole CORS layer.

@app.on_event("startup")
async def startup():
    await init_governance_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "governance"}

app.include_router(router)
