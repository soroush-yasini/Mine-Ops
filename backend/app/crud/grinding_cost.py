import uuid
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.grinding_cost import GrindingCost
from app.schemas.grinding_cost import GrindingCostCreate, GrindingCostUpdate


def get(db: Session, cost_id: uuid.UUID) -> GrindingCost | None:
    return (
        db.query(GrindingCost)
        .options(joinedload(GrindingCost.site))
        .filter(GrindingCost.id == cost_id)
        .first()
    )


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    site_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> tuple[list[GrindingCost], int]:
    query = db.query(GrindingCost).options(joinedload(GrindingCost.site))
    if site_id:
        query = query.filter(GrindingCost.site_id == site_id)
    if date_from:
        query = query.filter(GrindingCost.date_gregorian >= date_from)
    if date_to:
        query = query.filter(GrindingCost.date_gregorian <= date_to)
    total = query.count()
    items = (
        query.order_by(GrindingCost.date_gregorian.asc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return items, total


def get_balance(db: Session, site_id: uuid.UUID | None = None) -> int:
    query = db.query(func.coalesce(func.sum(GrindingCost.debit - GrindingCost.credit), 0))
    if site_id:
        query = query.filter(GrindingCost.site_id == site_id)
    result = query.scalar()
    return int(result) if result is not None else 0


def create(db: Session, obj_in: GrindingCostCreate, created_by: uuid.UUID | None = None) -> GrindingCost:
    db_obj = GrindingCost(
        date_jalali=obj_in.date_jalali,
        date_gregorian=obj_in.date_gregorian,
        site_id=obj_in.site_id,
        description=obj_in.description,
        invoice_no=obj_in.invoice_no,
        receipt_no=obj_in.receipt_no,
        tonnage_kg=obj_in.tonnage_kg,
        rate_per_kg=obj_in.rate_per_kg,
        debit=obj_in.debit,
        credit=obj_in.credit,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: GrindingCost, obj_in: GrindingCostUpdate) -> GrindingCost:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def delete(db: Session, cost_id: uuid.UUID) -> bool:
    obj = db.query(GrindingCost).filter(GrindingCost.id == cost_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
