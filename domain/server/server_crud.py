import asyncio
from typing import Union
from fastapi import Depends
from starlette.config import Config
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.user.user_schema import UserCreate
from domain.server.server_schema import ServerDetail, ServerList, BaseServer, ServerUpdate
from models import User, Server, ServerUser, Channel
from datetime import datetime

config = Config('.env')


async def create_server(db: AsyncSession, server_create: BaseServer, user: User) -> None:
    db_server = Server(user=user, name=server_create.name,
                       description=server_create.description)
    db_serverUser = ServerUser(user=user, server=db_server, name=user.nickname)
    db.add(db_server)
    db.add(db_serverUser)
    await db.commit()


async def get_server_by_id(db: AsyncSession, server_id: int) -> Union[Server, None]:
    stmt = select(Server).where(Server.id == server_id)
    result = await db.execute(stmt)
    server = result.scalar_one_or_none()
    return server


async def get_server_by_user_channel(db: AsyncSession, user: User, channel: Channel) -> Union[Server, None]:
    try:
        stmt = select(Server).join(User).join(Channel).where(
            User.id == user.id).where(Channel.id == channel.id)
        result = await db.execute(stmt)
        server = result.scalar_one_or_none()
        return server
    except AttributeError:
        return None


async def get_server_list(db: AsyncSession, user: User) -> list[Server]:
    stmt_server = select(ServerUser).options(
        selectinload(ServerUser.server).
        selectinload(Server.channel_list)
    ).where(ServerUser.user_id == user.id)
    result = await db.execute(stmt_server)
    serveruser_list = result.scalars().all()
    _server_list = [serveruser.server for serveruser in serveruser_list]
    return _server_list


async def update_server_data(db: AsyncSession, server: Server, data: ServerUpdate) -> None:
    for key, value in data.dict(exclude_defaults=True).items():
        setattr(server, key, value)
    await db.commit()


async def delete_server(db: AsyncSession, server: Server) -> None:
    stmt = select(ServerUser).where(ServerUser.server_id == server.id)
    result = await db.execute(stmt)
    serverusers = result.scalars().all()
    for serveruser in serverusers:
        await db.delete(serveruser)
    await db.delete(server)
    await db.commit()
