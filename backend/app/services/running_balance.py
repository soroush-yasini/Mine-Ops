from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.financial_ledger import FinancialLedger


async def recompute_balance(db: AsyncSession, facility_id: int) -> None:
    """Recompute running balance for all ledger entries of a facility in chronological order."""
    result = await db.execute(
        select(FinancialLedger)
        .where(FinancialLedger.facility_id == facility_id)
        .order_by(FinancialLedger.date, FinancialLedger.id)
    )
    entries = result.scalars().all()

    running = 0
    for entry in entries:
        if entry.debit:
            running -= entry.debit
        if entry.credit:
            running += entry.credit
        entry.balance = running

    await db.flush()
