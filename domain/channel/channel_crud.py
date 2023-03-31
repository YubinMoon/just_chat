from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.channel.channel_schema import ChannelCreate
from models import User, Server, ServerUser, Channel
from datetime import datetime


async def create_channel(db: AsyncSession, channel_create: ChannelCreate, user: User, server: Server):

    db_channel = Channel(name=channel_create.name, type=channel_create.type,
                         description=channel_create.description, server=server)
    db.add(db_channel)
    await db.commit()
