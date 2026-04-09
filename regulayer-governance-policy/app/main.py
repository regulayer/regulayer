from fastapi import FastAPI
from .api import router
from .storage import init_policy_db as init_db
from .config import settings

app = FastAPI(
    title="Regulayer Policy Engine",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    # Initialize policy database (tables)
    await init_db()

@app.get("/health")
async def health():
    return {"status": "ok", "service": "policy-engine"}

app.include_router(router)
