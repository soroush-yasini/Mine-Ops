from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.financial_ledger import FinancialLedger
from ..schemas.financial_ledger import LedgerCreate, LedgerUpdate, LedgerInvestigationUpdate, LedgerResponse
from ..services.tonnage_discrepancy import compute_discrepancy
from ..services.running_balance import recompute_balance
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/financial-ledger", tags=["financial-ledger"])


@router.get("/", response_model=List[LedgerResponse])
async def list_ledger(
    facility_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    discrepancy_flag: Optional[bool] = None,
    investigation_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(FinancialLedger)
    if facility_id:
        q = q.where(FinancialLedger.facility_id == facility_id)
    if date_from:
        q = q.where(FinancialLedger.date >= date_from)
    if date_to:
        q = q.where(FinancialLedger.date <= date_to)
    if discrepancy_flag is not None:
        q = q.where(FinancialLedger.discrepancy_flag == discrepancy_flag)
    if investigation_status:
        q = q.where(FinancialLedger.investigation_status == investigation_status)
    result = await db.execute(q.order_by(FinancialLedger.date, FinancialLedger.id))
    return result.scalars().all()


@router.post("/", response_model=LedgerResponse, status_code=201)
async def create_ledger_entry(data: LedgerCreate, db: AsyncSession = Depends(get_db)):
    obj = FinancialLedger(**data.model_dump())
    await compute_discrepancy(db, obj)
    db.add(obj)
    await db.commit()
    await recompute_balance(db, obj.facility_id)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=LedgerResponse)
async def get_ledger_entry(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FinancialLedger).where(FinancialLedger.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=LedgerResponse)
async def update_ledger_entry(id: int, data: LedgerUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FinancialLedger).where(FinancialLedger.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await compute_discrepancy(db, obj)
    await db.commit()
    await recompute_balance(db, obj.facility_id)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.patch("/{id}/investigation", response_model=LedgerResponse)
async def update_investigation(id: int, data: LedgerInvestigationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FinancialLedger).where(FinancialLedger.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_ledger_entry(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FinancialLedger).where(FinancialLedger.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    facility_id = obj.facility_id
    await db.delete(obj)
    await db.commit()
    await recompute_balance(db, facility_id)
    await db.commit()
