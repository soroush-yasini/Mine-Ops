import uuid
from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models.bunker_transport import BunkerTransport
from app.schemas.bunker_transport import BunkerTransportCreate, BunkerTransportUpdate

DEAD_FREIGHT_THRESHOLD = 25000


def compute_dead_freight(tonnage_kg: int) -> tuple[bool, int]:
    is_dead_freight = tonnage_kg < DEAD_FREIGHT_THRESHOLD
    billed_tonnage_kg = max(tonnage_kg, DEAD_FREIGHT_THRESHOLD)
    return is_dead_freight, billed_tonnage_kg


def get(db: Session, transport_id: uuid.UUID) -> BunkerTransport | None:
    return (
        db.query(BunkerTransport)
        .options(
            joinedload(BunkerTransport.truck),
            joinedload(BunkerTransport.driver),
            joinedload(BunkerTransport.origin),
        )
        .filter(BunkerTransport.id == transport_id)
        .first()
    )


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    date_from: date | None = None,
    date_to: date | None = None,
    is_paid: bool | None = None,
    driver_id: uuid.UUID | None = None,
    origin_id: uuid.UUID | None = None,
) -> tuple[list[BunkerTransport], int]:
    query = db.query(BunkerTransport).options(
        joinedload(BunkerTransport.truck),
        joinedload(BunkerTransport.driver),
        joinedload(BunkerTransport.origin),
    )
    if date_from:
        query = query.filter(BunkerTransport.date_gregorian >= date_from)
    if date_to:
        query = query.filter(BunkerTransport.date_gregorian <= date_to)
    if is_paid is not None:
        query = query.filter(BunkerTransport.is_paid == is_paid)
    if driver_id:
        query = query.filter(BunkerTransport.driver_id == driver_id)
    if origin_id:
        query = query.filter(BunkerTransport.origin_id == origin_id)
    total = query.count()
    items = (
        query.order_by(BunkerTransport.date_gregorian.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return items, total


def create(db: Session, obj_in: BunkerTransportCreate, created_by: uuid.UUID | None = None) -> BunkerTransport:
    is_dead_freight, billed_tonnage_kg = compute_dead_freight(obj_in.tonnage_kg)
    db_obj = BunkerTransport(
        date_jalali=obj_in.date_jalali,
        date_gregorian=obj_in.date_gregorian,
        time=obj_in.time,
        truck_id=obj_in.truck_id,
        driver_id=obj_in.driver_id,
        receipt_no=obj_in.receipt_no,
        tonnage_kg=obj_in.tonnage_kg,
        origin_id=obj_in.origin_id,
        cost_per_kg=obj_in.cost_per_kg,
        is_dead_freight=is_dead_freight,
        billed_tonnage_kg=billed_tonnage_kg,
        notes=obj_in.notes,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: BunkerTransport, obj_in: BunkerTransportUpdate) -> BunkerTransport:
    update_data = obj_in.model_dump(exclude_unset=True)
    if "tonnage_kg" in update_data:
        is_dead_freight, billed_tonnage_kg = compute_dead_freight(update_data["tonnage_kg"])
        update_data["is_dead_freight"] = is_dead_freight
        update_data["billed_tonnage_kg"] = billed_tonnage_kg
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def mark_paid(db: Session, db_obj: BunkerTransport, payment_date_jalali: str, payment_date_gregorian: date) -> BunkerTransport:
    db_obj.is_paid = True
    db_obj.status = "paid"
    db_obj.payment_date_jalali = payment_date_jalali
    db_obj.payment_date_gregorian = payment_date_gregorian
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def update_bol_image(db: Session, db_obj: BunkerTransport, image_path: str) -> BunkerTransport:
    db_obj.bill_of_lading_image = image_path
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def update_payment_receipt(db: Session, db_obj: BunkerTransport, image_path: str) -> BunkerTransport:
    db_obj.payment_receipt_image = image_path
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def delete(db: Session, transport_id: uuid.UUID) -> bool:
    obj = db.query(BunkerTransport).filter(BunkerTransport.id == transport_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
