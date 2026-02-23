import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.lab_assay import LabAssay
from app.models.lab_batch import LabBatch
from app.schemas.lab_batch import LabBatchCreate, LabBatchUpdate


def get(db: Session, batch_id: uuid.UUID) -> LabBatch | None:
    batch = db.query(LabBatch).filter(LabBatch.id == batch_id).first()
    if batch:
        batch.assay_count = db.query(func.count(LabAssay.id)).filter(LabAssay.batch_id == batch_id).scalar() or 0
    return batch


def get_multi(
    db: Session,
    page: int = 1,
    size: int = 20,
) -> tuple[list[LabBatch], int]:
    query = db.query(LabBatch)
    total = query.count()
    items = query.order_by(LabBatch.issue_date_gregorian.desc()).offset((page - 1) * size).limit(size).all()
    for batch in items:
        batch.assay_count = db.query(func.count(LabAssay.id)).filter(LabAssay.batch_id == batch.id).scalar() or 0
    return items, total


def create(db: Session, obj_in: LabBatchCreate, created_by: uuid.UUID | None = None) -> LabBatch:
    db_obj = LabBatch(
        issue_date_jalali=obj_in.issue_date_jalali,
        issue_date_gregorian=obj_in.issue_date_gregorian,
        total_cost=obj_in.total_cost,
        notes=obj_in.notes,
        created_by=created_by,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: LabBatch, obj_in: LabBatchUpdate) -> LabBatch:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def update_receipt_pdf(db: Session, db_obj: LabBatch, pdf_path: str) -> LabBatch:
    db_obj.receipt_pdf = pdf_path
    db.add(db_obj)
    db.commit()
    return get(db, db_obj.id)


def delete(db: Session, batch_id: uuid.UUID) -> bool:
    obj = db.query(LabBatch).filter(LabBatch.id == batch_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
