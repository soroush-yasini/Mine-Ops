from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.bunker_trip import BunkerTrip


async def compute_discrepancy(db: AsyncSession, ledger_entry) -> None:
    """Compute tonnage discrepancy between ledger entry and bunker trip."""
    if ledger_entry.receipt_number:
        result = await db.execute(
            select(BunkerTrip).where(BunkerTrip.receipt_number == ledger_entry.receipt_number)
        )
        bunker_trip = result.scalar_one_or_none()
        if bunker_trip:
            ledger_entry.bunker_trip_id = bunker_trip.id
            if ledger_entry.ledger_tonnage_kg is not None:
                diff = ledger_entry.ledger_tonnage_kg - bunker_trip.tonnage_kg
                ledger_entry.tonnage_discrepancy_kg = diff
                ledger_entry.discrepancy_flag = abs(diff) > 0
            else:
                ledger_entry.tonnage_discrepancy_kg = None
                ledger_entry.discrepancy_flag = False
        else:
            ledger_entry.tonnage_discrepancy_kg = None
            ledger_entry.discrepancy_flag = False
    else:
        ledger_entry.tonnage_discrepancy_kg = None
        ledger_entry.discrepancy_flag = False
