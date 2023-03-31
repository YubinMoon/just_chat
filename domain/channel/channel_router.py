from datetime import timedelta, datetime

from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.config import Config

from database import get_async_db

from domain.channel import channel_crud, channel_schema

from domain.server.server_crud import get_server_list
from domain.user.user_router import get_current_user

from models import User

config = Config('.env')

router = APIRouter(
    prefix="/api/channel",
)


@router.post("/create", status_code=status.HTTP_204_NO_CONTENT)
async def channel_create(_channel_create: channel_schema.ChannelCreate, db: AsyncSession = Depends(get_async_db), _user: User = Depends(get_current_user)):
    if len(_channel_create.name) < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="채널 이름이 너무 짧습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    server_list = await get_server_list(db=db, user=_user)
    for server in server_list:
        if _channel_create.server_id == server.id:
            await channel_crud.create_channel(
                db=db, channel_create=_channel_create, user=_user, server=server)
            return
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="권한이 없습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
