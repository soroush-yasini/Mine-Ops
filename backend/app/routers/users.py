import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, role_required
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.get("", response_model=UserListResponse)
def list_users(
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
) -> UserListResponse:
    items, total = crud_user.get_multi(db, page=page, size=size)
    return UserListResponse(items=items, total=total, page=page, size=size)


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if current_user.role != "manager" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    obj_in: UserCreate,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if crud_user.get_by_username(db, obj_in.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    return crud_user.create(db, obj_in)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: uuid.UUID,
    obj_in: UserUpdate,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if obj_in.username and obj_in.username != user.username:
        if crud_user.get_by_username(db, obj_in.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    return crud_user.update(db, user, obj_in)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: uuid.UUID,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud_user.delete(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
