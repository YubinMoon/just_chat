from datetime import timedelta, datetime

from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.config import Config

from database import get_async_db
from domain.server import server_crud, server_schema
from domain.user.user_router import get_current_user
from domain.user.user_crud import pwd_context

from models import User

config = Config('.env')

router = APIRouter(
    prefix="/api/server",
)


@router.post("/create", status_code=status.HTTP_204_NO_CONTENT)
async def server_create(_server_create: server_schema.ServerCreate, db: AsyncSession = Depends(get_async_db), _user: User = Depends(get_current_user)):
    await server_crud.create_server(db=db, server_create=_server_create, user=_user)


@router.get("/list", response_model=server_schema.ServerList)
async def server_list(db: AsyncSession = Depends(get_async_db), _user: User = Depends(get_current_user)):
    _server_list = await server_crud.get_server_list(db=db, user=_user)
    return {
        'total': len(_server_list),
        'server_list':_server_list
    }