import uuid

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get(db: Session, user_id: uuid.UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_multi(db: Session, page: int = 1, size: int = 20) -> tuple[list[User], int]:
    query = db.query(User)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total


def create(db: Session, obj_in: UserCreate) -> User:
    db_obj = User(
        username=obj_in.username,
        full_name=obj_in.full_name,
        password_hash=get_password_hash(obj_in.password),
        role=obj_in.role,
        is_active=obj_in.is_active,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    update_data = obj_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete(db: Session, user_id: uuid.UUID) -> bool:
    obj = db.query(User).filter(User.id == user_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
