from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Body, Path
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from database import get_async_db
from domain.server import server_crud, server_schema
from domain.user.user_crud import get_user_from_token
from domain.user.user_crud import credentials_exception

from models import User


router = APIRouter(
    prefix="/api/server",
    tags=["Server"]
)


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
