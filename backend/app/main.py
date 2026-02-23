import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import (
    auth,
    bunker_transport,
    drivers,
    grinding_costs,
    grinding_sites,
    lab_assays,
    lab_batches,
    mine_transport,
    sample_types,
    trucks,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "bol"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "payment_receipts"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "lab_pdfs"), exist_ok=True)
    yield


app = FastAPI(title="Mine-Ops API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(drivers.router, prefix=API_PREFIX)
app.include_router(trucks.router, prefix=API_PREFIX)
app.include_router(grinding_sites.router, prefix=API_PREFIX)
app.include_router(sample_types.router, prefix=API_PREFIX)
app.include_router(mine_transport.router, prefix=API_PREFIX)
app.include_router(bunker_transport.router, prefix=API_PREFIX)
app.include_router(grinding_costs.router, prefix=API_PREFIX)
app.include_router(lab_batches.router, prefix=API_PREFIX)
app.include_router(lab_assays.router, prefix=API_PREFIX)

# StaticFiles mounted at startup after directory creation
@app.on_event("startup")
async def mount_uploads():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR if os.path.exists(settings.UPLOAD_DIR) else "/tmp"), name="uploads")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
