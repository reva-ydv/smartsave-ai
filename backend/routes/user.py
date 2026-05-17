from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from schemas.user import UserCreate
from utils.auth import hash_password

router = APIRouter()


@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    hashed_pw = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw,
        income=user.income,
        savings_goal=user.savings_goal,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
    }