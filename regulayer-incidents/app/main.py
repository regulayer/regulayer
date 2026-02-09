
from fastapi import FastAPI
from .api import router
from .db import engine, Base

app = FastAPI(
    title="Regulayer Incidents Service",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}
