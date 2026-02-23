import uuid

from sqlalchemy.orm import Session, joinedload

from app.models.lab_assay import LabAssay
from app.schemas.lab_assay import LabAssayCreate, LabAssayUpdate


def get(db: Session, assay_id: uuid.UUID) -> LabAssay | None:
    return (
        db.query(LabAssay)
        .options(
            joinedload(LabAssay.batch),
            joinedload(LabAssay.facility),
            joinedload(LabAssay.sample_type),
        )
        .filter(LabAssay.id == assay_id)
        .first()
    )


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
    batch_id: uuid.UUID | None = None,
    facility_id: uuid.UUID | None = None,
    sample_type_id: uuid.UUID | None = None,
) -> tuple[list[LabAssay], int]:
    query = db.query(LabAssay).options(
        joinedload(LabAssay.batch),
        joinedload(LabAssay.facility),
        joinedload(LabAssay.sample_type),
    )
    if batch_id:
        query = query.filter(LabAssay.batch_id == batch_id)
    if facility_id:
        query = query.filter(LabAssay.facility_id == facility_id)
    if sample_type_id:
        query = query.filter(LabAssay.sample_type_id == sample_type_id)
    total = query.count()
    items = (
        query.order_by(LabAssay.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return items, total


def create(db: Session, obj_in: LabAssayCreate, created_by: uuid.UUID | None = None) -> LabAssay:
    db_obj = LabAssay(
        batch_id=obj_in.batch_id,
        sample_code=obj_in.sample_code,
        facility_id=obj_in.facility_id,
        sample_date_jalali=obj_in.sample_date_jalali,
        sample_date_gregorian=obj_in.sample_date_gregorian,
        sample_type_id=obj_in.sample_type_id,
        sample_index=obj_in.sample_index,
        au_ppm=obj_in.au_ppm,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: LabAssay, obj_in: LabAssayUpdate) -> LabAssay:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def delete(db: Session, assay_id: uuid.UUID) -> bool:
    obj = db.query(LabAssay).filter(LabAssay.id == assay_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
