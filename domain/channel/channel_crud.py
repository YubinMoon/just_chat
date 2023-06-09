from typing import Union
from fastapi import Depends
from sqlalchemy import select
from starlette.config import Config
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.channel.channel_schema import ChannelCreate, BasicChannel
from models import User, Server, ServerUser, Channel
from datetime import datetime
from database import get_async_db
config = Config('.env')


async def create_channel(db: AsyncSession, channel_create: ChannelCreate, server: Server) -> Channel:
    db_channel = Channel(name=channel_create.name, type=channel_create.type,
                         description=channel_create.description, server=server)
    db.add(db_channel)
    await db.commit()
    return db_channel


async def get_channel_by_id(db: AsyncSession, channel_id: int) -> Union[Channel, None]:
    stmt = select(Channel).where(Channel.id == channel_id)
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    return channel


async def get_channel_by_server(db: AsyncSession, server: Server) -> list[Channel]:
    stmt = select(Channel).where(Channel.server_id == server.id)
    result = await db.execute(stmt)
    channel_list = result.scalars().all()
    return channel_list


async def get_channel_by_user(db: AsyncSession = Depends(get_async_db), user: User = None) -> list[Channel]:
    if not user:
        return []
    stmt = select(Channel).join(Server).join(
        ServerUser).join(User).where(User.id == user.id)
    result = await db.execute(stmt)
    channel_list = result.scalars().all()
    return channel_list


async def update_channel(db: AsyncSession, channel: Channel, _data: BasicChannel) -> None:
    for key, value in _data.dict(exclude_defaults=True).items():
        setattr(channel, key, value)
    await db.commit()


async def delete_channel(db: AsyncSession, channel: Channel) -> None:
    stmt = select(Channel).where(Channel.id == channel.id)
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    if not channel:
        return
    await db.delete(channel)
    await db.commit()
