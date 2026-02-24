from fastapi import APIRouter
from .truck_trips_importer import router as truck_trips_router
from .bunker_trips_importer import router as bunker_trips_router
from .lab_samples_importer import router as lab_samples_router
from .financial_ledger_importer import router as financial_ledger_router

router = APIRouter(prefix="/import", tags=["import"])
router.include_router(truck_trips_router)
router.include_router(bunker_trips_router)
router.include_router(lab_samples_router)
router.include_router(financial_ledger_router)
