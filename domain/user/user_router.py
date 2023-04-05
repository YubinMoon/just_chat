from typing import Annotated, Union, Optional
from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Body, Query, Path
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.config import Config
from database import get_async_db
from domain.user import user_crud, user_schema
from domain.user.user_crud import pwd_context

from models import User


router = APIRouter(
    prefix="/api/user",
    tags=["User"],
)


@router.post(
    "/create",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Create User Account",
)
async def user_create(
    _user_create: Annotated[user_schema.UserCreate, Body(embed=True)],
    db: AsyncSession = Depends(get_async_db)
):
    user = await user_crud.get_user_from_name(db, username=_user_create.username)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="이미 존재하는 사용자입니다.")
    await user_crud.create_user(db=db, user_create=_user_create)


@router.post(
    "/login",
    response_model=user_schema.Token,
    summary="login for access token"
)
async def user_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db)
):
    # check user and password
    user = await user_crud.get_user_from_name(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="비번 또는 아이디가 틀림",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = await user_crud.get_user_token(user=user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }


@router.post(
    "/refresh",
    response_model=user_schema.Token,
    summary="get new access token",
    description="can reload user access token without login"
)
async def token_refresh(
    current_user: User = Depends(user_crud.get_user_from_token)
):
    access_token = await user_crud.get_user_token(user=current_user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": current_user.username
    }


@router.get(
    "/list",
    response_model=list[user_schema.UserInfo],
    summary="get user by username",
)
async def user_list(
    page: int = Query(default=0, title="pag of user list"),
    current_user: User = Depends(user_crud.get_user_from_token),
    db: AsyncSession = Depends(get_async_db),
):
    limit = 100
    offset = page*limit
    if not current_user.admin:
        raise user_crud.credentials_exception
    user_list = await user_crud.get_user_list(db=db, offset=offset, limit=limit)
    return user_list


@router.get(
    "/get/{user_name}",
    response_model=user_schema.UserInfo,
    summary="get user by username",
)
async def user_get(
    user_name: Optional[str] = Path(title="username"),
    current_user: User = Depends(user_crud.get_user_from_token),
    db: AsyncSession = Depends(get_async_db),
):
    if not current_user.admin and user_name != current_user.username:
        raise user_crud.credentials_exception
    user = await user_crud.get_user_from_name(db=db, username=user_name)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="존재하지 않는 사용자",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.put(
    "/update",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="user info update",
)
async def user_update(
    new_data: user_schema.UserUpdate = Body(title="users new data"),
    current_user: User = Depends(user_crud.get_user_from_token),
    db: AsyncSession = Depends(get_async_db),
):
    await user_crud.update_user_info(db=db, user=current_user, new_user=new_data)


@router.delete(
    "/delete",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="user delete",
)
async def user_delete(
    username: str = Body(),
    current_user: User = Depends(user_crud.get_user_from_token),
    db: AsyncSession = Depends(get_async_db),
):
    if not current_user.admin:
        raise user_crud.credentials_exception
    await user_crud.delete_user(db=db, username=username)
