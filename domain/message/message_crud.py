from typing import Union
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.message.message_schema import BaseMessage
from models import User, Channel, Message
from datetime import datetime


async def create_message(db: AsyncSession, data: BaseMessage, user: User) -> Message:
    new_user = await db.merge(user)
    message = Message(
        channel_id=data.channel_id,
        user=new_user,
        content_type=data.content_type,
        content=data.content,
        create_date=datetime.now()
    )
    db.add(message)
    await db.commit()
    return message


async def get_message_by_id(db: AsyncSession, message_id: int) -> Union[Message, None]:
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    message = result.scalar_one_or_none()
    return message


async def get_message_list(db: AsyncSession, offset: int, limit: int, channel: Channel) -> list[Message]:
    stmt = select(Message).join(Channel).options(
        selectinload(Message.user)
    ).where(Channel.id == channel.id).offset(offset).limit(limit)
    result = await db.execute(stmt)
    message_list = result.scalars().all()
    return message_list


async def update_message(db: AsyncSession, message: Message, data: BaseMessage) -> None:
    if message.content_type == data.content_type:
        message.content = data.content
    await db.commit()


async def delete_message(db: AsyncSession, message: Message) -> None:
    await db.delete(message)
    await db.commit()
