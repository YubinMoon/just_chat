from typing import Union
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.message.message_schema import MessageGet, BaseMessage, UserMessage
from models import User, Server, ServerUser, Channel, Message
from datetime import datetime
from domain.channel.channel_crud import get_channel_by_id, get_channel_list_by_user
from websocket import manager
from pydantic import ValidationError, parse_obj_as
from domain.user.user_crud import credentials_exception


async def create_message(db: AsyncSession, data: BaseMessage, user: User) -> Message:
    message = Message(
        channel_id=data.channel_id,
        user=user,
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


async def delete_message(db: AsyncSession, message: Message) -> None:
    await db.delete(message)
    await db.commit()

async def message_socket(db: AsyncSession, websocket: WebSocket, user: User) -> None:
    await manager.connect(db=db, user=user, websocket=websocket)
    try:
        while True:
            data = await websocket.receive_json()
            try:
                message_data = BaseMessage(**data)
                if message_data.channel_id not in manager.channels.keys():
                    await websocket.send_json({"detail": "Could not validate credentials"})
                    continue
                msg = await create_message(db=db, data=message_data, user=user)
                message = parse_obj_as(UserMessage,msg)
                await manager.broadcast(db=db, user=user, message=message)
            except ValidationError as e:
                # 오류 메시지와 함께 검증 오류 처리
                await websocket.send_text(f"Error: {str(e)}")

    except WebSocketDisconnect:
        manager.disconnect(user=user, websocket=websocket)
