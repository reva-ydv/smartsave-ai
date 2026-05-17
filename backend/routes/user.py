from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from schemas.user import UserCreate, UserLogin
from utils.auth import hash_password
from utils.auth import verify_password
from utils.jwt import create_access_token


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

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        return {
            "error": "Invalid email or password"
        }

    valid_password = verify_password(
        user.password,
        existing_user.hashed_password,
    )

    if not valid_password:
        return {
            "error": "Invalid email or password"
        }

    token = create_access_token(
        data={
            "user_id": existing_user.id,
            "email": existing_user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }