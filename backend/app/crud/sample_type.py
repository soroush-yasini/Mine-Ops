import uuid

from sqlalchemy.orm import Session

from app.models.sample_type import SampleType
from app.schemas.sample_type import SampleTypeCreate, SampleTypeUpdate


def get(db: Session, sample_type_id: uuid.UUID) -> SampleType | None:
    return db.query(SampleType).filter(SampleType.id == sample_type_id).first()


def get_by_code(db: Session, code: str) -> SampleType | None:
    return db.query(SampleType).filter(SampleType.code == code).first()


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
) -> tuple[list[SampleType], int]:
    query = db.query(SampleType)
    total = query.count()
    items = query.order_by(SampleType.code).offset((page - 1) * size).limit(size).all()
    return items, total


def create(db: Session, obj_in: SampleTypeCreate, created_by: uuid.UUID | None = None) -> SampleType:
    db_obj = SampleType(
        code=obj_in.code,
        name_fa=obj_in.name_fa,
        name_en=obj_in.name_en,
        description=obj_in.description,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: SampleType, obj_in: SampleTypeUpdate) -> SampleType:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete(db: Session, sample_type_id: uuid.UUID) -> bool:
    obj = db.query(SampleType).filter(SampleType.id == sample_type_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
