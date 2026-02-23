import uuid
from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models.mine_transport import MineTransport
from app.schemas.mine_transport import MineTransportCreate, MineTransportUpdate


def get(db: Session, transport_id: uuid.UUID) -> MineTransport | None:
    return (
        db.query(MineTransport)
        .options(
            joinedload(MineTransport.truck),
            joinedload(MineTransport.driver),
            joinedload(MineTransport.destination),
        )
        .filter(MineTransport.id == transport_id)
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
    destination_id: uuid.UUID | None = None,
) -> tuple[list[MineTransport], int]:
    query = db.query(MineTransport).options(
        joinedload(MineTransport.truck),
        joinedload(MineTransport.driver),
        joinedload(MineTransport.destination),
    )
    if date_from:
        query = query.filter(MineTransport.date_gregorian >= date_from)
    if date_to:
        query = query.filter(MineTransport.date_gregorian <= date_to)
    if is_paid is not None:
        query = query.filter(MineTransport.is_paid == is_paid)
    if driver_id:
        query = query.filter(MineTransport.driver_id == driver_id)
    if destination_id:
        query = query.filter(MineTransport.destination_id == destination_id)
    total = query.count()
    items = (
        query.order_by(MineTransport.date_gregorian.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return items, total


def create(db: Session, obj_in: MineTransportCreate, created_by: uuid.UUID | None = None) -> MineTransport:
    db_obj = MineTransport(
        date_jalali=obj_in.date_jalali,
        date_gregorian=obj_in.date_gregorian,
        truck_id=obj_in.truck_id,
        driver_id=obj_in.driver_id,
        receipt_no=obj_in.receipt_no,
        tonnage_kg=obj_in.tonnage_kg,
        destination_id=obj_in.destination_id,
        cost_per_kg=obj_in.cost_per_kg,
        notes=obj_in.notes,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: MineTransport, obj_in: MineTransportUpdate) -> MineTransport:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def mark_paid(db: Session, db_obj: MineTransport, payment_date_jalali: str, payment_date_gregorian: date) -> MineTransport:
    db_obj.is_paid = True
    db_obj.status = "paid"
    db_obj.payment_date_jalali = payment_date_jalali
    db_obj.payment_date_gregorian = payment_date_gregorian
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def update_bol_image(db: Session, db_obj: MineTransport, image_path: str) -> MineTransport:
    db_obj.bill_of_lading_image = image_path
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def update_payment_receipt(db: Session, db_obj: MineTransport, image_path: str) -> MineTransport:
    db_obj.payment_receipt_image = image_path
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def delete(db: Session, transport_id: uuid.UUID) -> bool:
    obj = db.query(MineTransport).filter(MineTransport.id == transport_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
