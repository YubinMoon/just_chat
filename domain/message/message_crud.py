from typing import Union
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.message.message_schema import MessageGet, BaseMessage
from models import User, Server, ServerUser, Channel, Message
from datetime import datetime


async def create_message(db: AsyncSession, data: BaseMessage, user: User) -> None:
    message = Message(
        channel_id=data.channel_id,
        user=user,
        content_type=data.content_type,
        content=data.content,
        create_date=datetime.now()
    )
    db.add(message)
    await db.commit()


async def get_message_by_id(db: AsyncSession, message_id: int) -> Union[Message, None]:
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    message = result.scalar_one_or_none()
    return message


async def get_message_list(db: AsyncSession, offset: int, limit: int, channel: Channel) -> Union[list[Message], None]:
    stmt = select(Message).join(Channel).where(
        Channel.id == channel.id).offset(offset).limit(limit)
    result = await db.execute(stmt)
    message_list = result.scalars().all()
    return message_list


async def update_message(db: AsyncSession, message: Message, data: BaseMessage) -> None:
    if message.content_type == data.content_type:
        message.content = data.content
    await db.commit()

async def delete_message(db:AsyncSession, message:Message)->None:
    print("asdf")
    await db.delete(message)
    await db.commit()