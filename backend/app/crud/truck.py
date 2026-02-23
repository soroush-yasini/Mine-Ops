import uuid

from sqlalchemy.orm import Session

from app.models.truck import Truck
from app.schemas.truck import TruckCreate, TruckUpdate


def get(db: Session, truck_id: uuid.UUID) -> Truck | None:
    return db.query(Truck).filter(Truck.id == truck_id).first()


def get_by_plate(db: Session, plate_number: str) -> Truck | None:
    return db.query(Truck).filter(Truck.plate_number == plate_number).first()


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    active_only: bool = False,
) -> tuple[list[Truck], int]:
    query = db.query(Truck)
    if active_only:
        query = query.filter(Truck.is_active.is_(True))
    total = query.count()
    items = query.order_by(Truck.plate_number).offset((page - 1) * size).limit(size).all()
    return items, total


def create(db: Session, obj_in: TruckCreate, created_by: uuid.UUID | None = None) -> Truck:
    db_obj = Truck(
        plate_number=obj_in.plate_number,
        is_active=obj_in.is_active,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: Truck, obj_in: TruckUpdate) -> Truck:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def soft_delete(db: Session, truck_id: uuid.UUID) -> Truck | None:
    obj = db.query(Truck).filter(Truck.id == truck_id).first()
    if not obj:
        return None
    obj.is_active = False
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
