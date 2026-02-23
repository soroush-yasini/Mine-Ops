import uuid

from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate


def get(db: Session, driver_id: uuid.UUID) -> Driver | None:
    return db.query(Driver).filter(Driver.id == driver_id).first()


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    active_only: bool = False,
) -> tuple[list[Driver], int]:
    query = db.query(Driver)
    if search:
        query = query.filter(Driver.full_name.ilike(f"%{search}%"))
    if active_only:
        query = query.filter(Driver.is_active == True)
    total = query.count()
    items = query.order_by(Driver.full_name).offset((page - 1) * size).limit(size).all()
    return items, total


def create(db: Session, obj_in: DriverCreate, created_by: uuid.UUID | None = None) -> Driver:
    db_obj = Driver(
        full_name=obj_in.full_name,
        iban=obj_in.iban,
        phone=obj_in.phone,
        is_active=obj_in.is_active,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: Driver, obj_in: DriverUpdate) -> Driver:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def soft_delete(db: Session, driver_id: uuid.UUID) -> Driver | None:
    obj = db.query(Driver).filter(Driver.id == driver_id).first()
    if not obj:
        return None
    obj.is_active = False
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
