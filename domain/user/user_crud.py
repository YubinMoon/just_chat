from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session
from domain.user.user_schema import UserCreate
from models import User
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_user(db: Session, user_create: UserCreate):
    db_user = User(username=user_create.username,
                   password=pwd_context.hash(user_create.password1),
                   nickname=user_create.nickname,
                   create_date=datetime.now())
    db.add(db_user)
    await db.commit()


async def get_existing_user(db: Session, user_create: UserCreate):
    result = await db.execute(
        select(User).filter(
            (User.username == user_create.username)
        )
    )
    return result.scalars().all()


async def get_user(db: Session, username: str):
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalar_one_or_none()