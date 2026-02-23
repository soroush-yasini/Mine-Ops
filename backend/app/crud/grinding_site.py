import uuid

from sqlalchemy.orm import Session

from app.models.grinding_site import GrindingSite
from app.schemas.grinding_site import GrindingSiteCreate, GrindingSiteUpdate


def get(db: Session, site_id: uuid.UUID) -> GrindingSite | None:
    return db.query(GrindingSite).filter(GrindingSite.id == site_id).first()


def get_by_code(db: Session, code: str) -> GrindingSite | None:
    return db.query(GrindingSite).filter(GrindingSite.code == code).first()


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    active_only: bool = False,
) -> tuple[list[GrindingSite], int]:
    query = db.query(GrindingSite)
    if active_only:
        query = query.filter(GrindingSite.is_active.is_(True))
    total = query.count()
    items = query.order_by(GrindingSite.code).offset((page - 1) * size).limit(size).all()
    return items, total


def create(db: Session, obj_in: GrindingSiteCreate, created_by: uuid.UUID | None = None) -> GrindingSite:
    db_obj = GrindingSite(
        code=obj_in.code,
        name_fa=obj_in.name_fa,
        name_en=obj_in.name_en,
        is_active=obj_in.is_active,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: GrindingSite, obj_in: GrindingSiteUpdate) -> GrindingSite:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def soft_delete(db: Session, site_id: uuid.UUID) -> GrindingSite | None:
    obj = db.query(GrindingSite).filter(GrindingSite.id == site_id).first()
    if not obj:
        return None
    obj.is_active = False
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
