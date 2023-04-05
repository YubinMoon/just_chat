from datetime import timedelta, datetime

from fastapi import APIRouter, HTTPException
from fastapi import Depends, Query, Body, Path
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from database import get_async_db
from domain.channel import channel_crud, channel_schema
from domain.server.server_crud import get_server_list, get_server_by_id
from domain.user.user_crud import get_user_from_token
from domain.user.user_crud import credentials_exception

from models import User


router = APIRouter(
    prefix="/api/channel",
    tags=["Channel", "Incomplete"],
)


@router.post(
    "/create",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="create new channel"
)
async def channel_create(
        _channel_create: channel_schema.ChannelCreate,
        db: AsyncSession = Depends(get_async_db),
        _user: User = Depends(get_user_from_token)
):
    if len(_channel_create.name) < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="채널 이름이 너무 짧습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    server = await get_server_by_id(db=db, server_id=_channel_create.server_id)
    server_list = await get_server_list(db=db, user=_user)
    if server not in server_list:
        raise credentials_exception
    await channel_crud.create_channel(
        db=db, channel_create=_channel_create, server=server)


@router.get(
    "/{channel_id}",
    response_model=channel_schema.ChannelInfo,
    summary="get channel"
)
async def channel_get(
    channel_id=Query(title="channel id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
):
    # server_list = await get_server_list(db=db, user=_user)
    channel = await channel_crud.get_channel_by_id(db=db, channel_id=channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="채널이 없습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return channel


@router.put(
    "/{channel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="change channel info",
)
async def channel_update(
    channel_id=Path(title="channel id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
    _data: channel_schema.BasicChannel = Body(title="data for update"),
):
    if len(_data.name) < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="채널 이름이 너무 짧습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    channel = await channel_crud.get_channel_by_id(db=db, channel_id=channel_id)
    await channel_crud.update_channel(db=db, channel=channel, _data=_data)


@router.delete(
    "/{channel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="delete channel",
    description="not implemented",
)
async def channel_delete(
    channel_id=Path(title="channel id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
):
    channel = await channel_crud.get_channel_by_id(db=db, channel_id=channel_id)
    await channel_crud.delete_channel(db=db, channel=channel)
