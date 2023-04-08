from fastapi import WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError, parse_obj_as
from models import User, Channel, Message
from domain.message.message_crud import create_message
from domain.channel.channel_crud import get_channel_list_by_user
from domain.message.message_schema import MessageGet, BaseMessage, UserMessage
from domain.websocket.websocket_schema import *


class ConnectionManager:
    def __init__(self):
        # dict[channel_id, dict[user_id, WebSocket]]
        self.channels: dict[int, dict[int, WebSocket]] = {}
        # dict[user_id, list[channel_id]]
        self.users: dict[int, list[int]] = {}

    async def connect(self, db: AsyncSession, user: User, websocket: WebSocket):
        self.db = db
        await websocket.accept()
        channel_list = await get_channel_list_by_user(db=db, user=user)
        channel_id_list = [channel.id for channel in channel_list]
        self.users[user.id] = channel_id_list
        for channel_id in channel_id_list:
            if channel_id not in self.channels:
                self.channels[channel_id] = {}
            self.channels[channel_id][user.id] = websocket
        print(f"{user.nickname} is connected")

    def disconnect(self, user: User, websocket: WebSocket):
        try:
            for channel_id in self.users[user.id]:
                del self.channels[channel_id]
            del self.users[user.id]
            print(f"{user.nickname} is disconnected")
        except KeyError:
            print(f"disconnect Error: {user.id}")

    async def broadcast(self, message: ResMessage, channel_id: int):
        for user_id, websocket in self.channels[channel_id].items():
            await websocket.send_text(message.json(exclude_none=True))

    async def processing(self, data: dict, user: User, websocket: WebSocket):
        try:
            message_data = InputData(**data)
            if message_data.text_message:
                message: TextMessage = message_data.text_message
                if message.channel_id not in self.users[user.id]:
                    error = Error(error=ErrorMessage(detail="채널이 존재하지 않음"))
                    await websocket.send_text(error.json())
                msg = await create_message(db=self.db, data=message, user=user)
                user_msg = parse_obj_as(UserMessage, msg)
                res_msg = ResMessage(message=user_msg)
                await manager.broadcast(message=res_msg, channel_id=message.channel_id)
            if message_data.channel_config:
                config: ChannelConfig = message_data.channel_config
                if message.channel_id not in self.users[user.id]:
                    error = Error(error=ErrorMessage(detail="채널 접근 권한이 없음"))
                    await websocket.send_text(error.json())
                if config.setting_type == ChannelConfigType.create:
                    if len(config.detail) < 2:
                        error = Error(error=ErrorMessage(
                            detail="채널 이름이 너무 짧음"))
                        await websocket.send_text(error.json())
                if config.setting_type == ChannelConfigType.delete:
                    pass
                if config.setting_type == ChannelConfigType.modify:
                    pass
        except ValidationError as e:
            # 오류 메시지와 함께 검증 오류 처리
            error = Error(error=ErrorMessage(detail="데이터 포멧 에러"))
            await websocket.send_text(error.json())


manager = ConnectionManager()
