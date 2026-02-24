from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class LedgerBase(BaseModel):
    facility_id: int
    date: date
    description: str
    debit: Optional[int] = None
    credit: Optional[int] = None
    receipt_number: Optional[int] = None
    ledger_tonnage_kg: Optional[float] = None
    rate_per_ton: Optional[int] = None
    bunker_trip_id: Optional[int] = None
    investigation_notes: Optional[str] = None
    investigation_status: str = "pending"


class LedgerCreate(LedgerBase):
    pass


class LedgerUpdate(BaseModel):
    facility_id: Optional[int] = None
    date: Optional[date] = None
    description: Optional[str] = None
    debit: Optional[int] = None
    credit: Optional[int] = None
    receipt_number: Optional[int] = None
    ledger_tonnage_kg: Optional[float] = None
    rate_per_ton: Optional[int] = None
    bunker_trip_id: Optional[int] = None


class LedgerInvestigationUpdate(BaseModel):
    investigation_notes: Optional[str] = None
    investigation_status: str


class LedgerResponse(LedgerBase):
    id: int
    balance: Optional[int] = None
    tonnage_discrepancy_kg: Optional[float] = None
    discrepancy_flag: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
