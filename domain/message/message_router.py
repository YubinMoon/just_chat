from datetime import timedelta, datetime

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi import Depends, Query, Path, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.config import Config

from database import get_async_db

from domain.message import message_crud, message_schema

from domain.server.server_crud import get_server_list
from domain.channel.channel_crud import get_channel_by_id, get_channel_list_by_user
from domain.user.user_crud import get_user_from_token, credentials_exception

from models import User

config = Config('.env')

router = APIRouter(
    prefix="/api/message",
    tags=["Message"]
)


@router.post(
    "/create",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="create new message",
)
async def message_create(
    _msg_data: message_schema.BaseMessage,
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    channel_list = await get_channel_list_by_user(db=db, user=_user)
    channel_id_list = [c.id for c in channel_list]
    if _msg_data.channel_id not in channel_id_list:
        raise credentials_exception
    if _msg_data.content_type == message_schema.ContentType.text:
        await message_crud.create_message(db=db, data=_msg_data, user=_user)


@router.get(
    "/list",
    response_model=message_schema.MessageList,
    summary="get message list",
)
async def get_messages(
    channel_id: int = Query(title="channel id"),
    offset: int = Query(title="start"),
    limit: int = Query(title="size"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    channel_list = await get_channel_list_by_user(db=db, user=_user)
    channel_id_list = [c.id for c in channel_list]
    if channel_id not in channel_id_list:
        raise credentials_exception
    channel = channel_list[channel_id_list.index(channel_id)]
    message_list = await message_crud.get_message_list(
        db=db,
        offset=offset,
        limit=limit,
        channel=channel
    )

    result = message_schema.MessageList(
        total=len(message_list), message_list=message_list)
    return result


@router.put(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="update message",
)
async def update_message(
    message_id: int = Path(title="message id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
    _data: message_schema.BaseMessage = Body(title="new message data"),
):
    _message = await message_crud.get_message_by_id(db=db, message_id=message_id)
    if _message.user_id != _user.id:
        raise credentials_exception
    await message_crud.update_message(db=db, message=_message, data=_data)


@router.delete(
    "/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="delete message",
)
async def delete_message(
    message_id: int = Path(title="message id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
):
    message = await message_crud.get_message_by_id(db=db, message_id=message_id)
    if not message or message.user_id != _user.id:
        raise credentials_exception
    await message_crud.delete_message(db=db, message=message)


@router.websocket(
    "/ws",
    name="testsocket"
)
async def websocket(
    websocket: WebSocket,
    db: AsyncSession = Depends(get_async_db),
    # _user: User = Depends(get_user_from_token)
    token: str = Query(title="user token")
):
    _user = await get_user_from_token(token=token, db=db)
    await message_crud.message_socket(db=db, websocket=websocket, user=_user)
