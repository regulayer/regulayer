
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
    import asyncio
    for attempt in range(10):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception as e:
            if attempt == 9:
                raise e
            print(f"DB Init failed (attempt {attempt+1}/10), retrying in 3s... {e}")
            await asyncio.sleep(3)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}
