from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .routers import drivers, trucks, facilities, truck_trips, bunker_trips, lab_reports, lab_samples, financial_ledger
from .upload.handler import router as upload_router
from .import_excel.router import router as import_router

app = FastAPI(title="Mine-Ops API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
os.makedirs("/app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

# Include routers
api_prefix = "/api/v1"
app.include_router(drivers.router, prefix=api_prefix)
app.include_router(trucks.router, prefix=api_prefix)
app.include_router(facilities.router, prefix=api_prefix)
app.include_router(truck_trips.router, prefix=api_prefix)
app.include_router(bunker_trips.router, prefix=api_prefix)
app.include_router(lab_reports.router, prefix=api_prefix)
app.include_router(lab_samples.router, prefix=api_prefix)
app.include_router(financial_ledger.router, prefix=api_prefix)
app.include_router(upload_router, prefix=api_prefix)
app.include_router(import_router, prefix=api_prefix)


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}
