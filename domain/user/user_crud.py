from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from starlette.config import Config
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import jwt, JWTError
from models import User
from domain.user.user_schema import UserCreate, UserUpdate
from datetime import datetime, timedelta
from database import get_async_db

config = Config('.env')
ACCESS_TOKEN_EXPIRE_MINUTES = int(config('ACCESS_TOKEN_EXPIRE_MINUTES'))
SECRET_KEY = config('SECRET_KEY')
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_user_token(user: User) -> str:
    # make access token
    data = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    access_token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return access_token


async def create_user(db: AsyncSession, user_create: UserCreate) -> None:
    db_user = User(username=user_create.username,
                   password=pwd_context.hash(user_create.password1),
                   nickname=user_create.nickname,
                   create_date=datetime.now(),
                   admin=False)
    db.add(db_user)
    await db.commit()


async def get_user_list(db: AsyncSession, offset: int, limit: int) -> list[User]:
    stmt = select(User).offset(offset).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_user_from_name(db: AsyncSession, username: str) -> Union[User, None]:
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_from_token(token: str = Depends(oauth2_scheme),
                              db: AsyncSession = Depends(get_async_db)) -> Union[User, None]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception
    else:
        user = await get_user_from_name(db, username=username)
        if not user:
            raise credentials_exception
        return user


async def update_user_info(db: AsyncSession, user: User, new_user: UserUpdate) -> None:
    for key, value in new_user.dict(exclude_none=True, exclude_defaults=True).items():
        if key == "nickname":
            setattr(user, key, value)
        if key == "password1":
            setattr(user, key, pwd_context.hash(value))
    await db.commit()


async def delete_user(db: AsyncSession, username: str) -> None:
    user = await get_user_from_name(db=db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="존재하지 않는 사용자",
            headers={"WWW-Authenticate": "Bearer"},
        )
    await db.delete(user)
    await db.commit()
