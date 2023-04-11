from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Body, Path
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from database import get_async_db
from domain.server import server_crud, server_schema
from domain.user.user_crud import get_user_from_token, credentials_exception
from domain.user.user_schema import Token

from models import User


router = APIRouter(
    prefix="/api/server",
    tags=["Server"]
)


@router.get(
    "/invite/create/{server_id}",
    response_model=server_schema.InviteToken,
    summary="create server invite token"
)
async def create_invite_token(
    server_id: int = Path(title="server id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    _server = await server_crud.get_server_by_id(db=db, server_id=server_id)
    _server_list = await server_crud.get_server_list(db=db, user=_user)

    if _server not in _server_list:
        raise credentials_exception
    invite_token = await server_crud.create_invite_token(server_id=server_id)
    return {"invite_token": invite_token}


@router.post(
    "/invite/join/{invite_token}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="join server from token"
)
async def join_server(
    invite_token: str = Path(title="invite token"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    server_id = await server_crud.verify_invite_token(invite_token)
    server_list = await server_crud.get_server_list(db=db, user=_user)
    server_id_list = [server.id for server in server_list]
    if server_id in server_id_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="서버가 이미 존재합니다.",
        )
    await server_crud.insert_user(db=db, user=_user, server_id=server_id)


@router.post(
    "/create",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="create new server"
)
async def server_create(
    _server_create: server_schema.BaseServer,
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    await server_crud.create_server(db=db, server_create=_server_create, user=_user)


@router.get(
    "/list",
    response_model=server_schema.ServerList,
    summary="Load the server containing the user",
)
async def server_list(
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token)
):
    _server_list = await server_crud.get_server_list(db=db, user=_user)
    return server_schema.ServerList(total=len(_server_list), server_list=_server_list)


@router.put(
    "/update",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="update server info",
)
async def server_update(
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
    _data: server_schema.ServerUpdate = Body(title="server info")
):
    _server = await server_crud.get_server_by_id(db=db, server_id=_data.id)
    if _user.id != _server.user_id:
        raise credentials_exception
    await server_crud.update_server_data(db=db, server=_server, data=_data)


@router.delete(
    "/{server_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="delete server",
)
async def server_delete(
    server_id: int = Path(title="server id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
):
    _server = await server_crud.get_server_by_id(db=db, server_id=server_id)
    if not _server or _user.id != _server.user_id:
        raise credentials_exception
    await server_crud.delete_server(db=db, server=_server)


@router.delete(
    "/leave/{server_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="leave from server",
)
async def server_leave(
    server_id: int = Path(title="server id"),
    db: AsyncSession = Depends(get_async_db),
    _user: User = Depends(get_user_from_token),
):
    _server = await server_crud.get_server_by_id(db=db, server_id=server_id)
    _server_list = await server_crud.get_server_list(db=db, user=_user)
    if _server not in _server_list:
        raise credentials_exception
    if _server.user_id == _user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="서버장은 떠날 수 없습니다.")
    await server_crud.leave_server(db=db, server=_server, user=_user)
