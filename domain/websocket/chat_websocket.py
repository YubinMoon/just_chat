import traceback
import asyncio
from collections import defaultdict
from fastapi import WebSocket, Depends, logger
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError, parse_obj_as
from models import User, Channel, Message
from domain.message.message_crud import create_message
from domain.channel.channel_crud import create_channel, get_channel_by_user, get_channel_by_server, get_channel_by_id, delete_channel
from domain.server.server_crud import get_server_by_id, get_server_list, get_server_by_channel_id
from domain.message.message_schema import MessageGet, BaseMessage, UserMessage
from domain.websocket.websocket_schema import *


class ParamsError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self) -> str:
        return self.msg


class ConnectionManager:
    def __init__(self):
        # dict[server_id, set[user_id]]
        self.server_users: dict[int, set[int]] = defaultdict(set)
        # dict[user_id, set[server_id]]
        self.user_servers: dict[int, set[int]] = defaultdict(set)
        # dict[channel_id, set[user_id]]
        self.channel_users: dict[int, set[int]] = defaultdict(set)
        # dict[user_id, set[channel_id]]
        self.user_channels: dict[int, set[int]] = defaultdict(set)
        # dict[user_id, Websocket]
        self.websockets: dict[int, WebSocket] = {}

    async def connect(self, db: AsyncSession, user: User, websocket: WebSocket):
        self.db = db
        channel_list = await get_channel_by_user(db=db, user=user)
        for channel in channel_list:
            self.channel_users[channel.id].add(user.id)
            self.user_channels[user.id].add(channel.id)

        server_list = await get_server_list(db=self.db, user=user)
        for server in server_list:
            self.server_users[server.id].add(user.id)
            self.user_servers[user.id].add(server.id)
        self.websockets[user.id] = websocket
        logger.logger.info(f"{user.nickname} is connected")
        print(f"{user.nickname} is connected")

    def disconnect(self, user: User, websocket: WebSocket):
        user_id = user.id
        try:
            for channel_id in self.user_channels[user.id]:
                self.channel_users[channel_id].remove(user.id)
            del self.user_channels[user.id]

            for server_id in self.user_servers[user.id]:
                self.server_users[server_id].remove(user.id)
            del self.user_servers[user.id]
            del self.websockets[user.id]
            print(f"{user.nickname} is disconnected")
        except KeyError:
            print(f"disconnect Error: {user.id}")

    async def server_broadcast(self, message: ResMessage, server_id: int):
        send_tasts = []
        for user_id in self.server_users.get(server_id):
            websocket = self.websockets.get(user_id)
            task = asyncio.create_task(
                websocket.send_text(message.json(exclude_none=True)))
            send_tasts.append(task)

        await asyncio.gather(*send_tasts)

    async def processing(self, data: dict, user: User, websocket: WebSocket):
        try:
            message_data = InputData(**data)
            if message_data.text_message:
                message: TextMessage = message_data.text_message
                server = await get_server_by_channel_id(db=self.db, channel_id=message.channel_id)
                res_msg = await self.process_text_message(
                    message=message, user=user, websocket=websocket)
                await self.server_broadcast(message=res_msg, server_id=server.id)
            if message_data.channel_config:
                config: ChannelConfig = message_data.channel_config
                server = await get_server_by_id(db=self.db, server_id=config.server_id)
                res_msg = await self.process_channel_config(config=config, user=user, websocket=websocket)
                await self.server_broadcast(message=res_msg, server_id=server.id)
        except ValidationError as e:
            traceback.print_exc()
            error = Error(error=ErrorMessage(detail="데이터 포멧 에러"))
            await websocket.send_text(error.json())
        except ParamsError as e:
            error = Error(error=ErrorMessage(detail=str(e)))
            await websocket.send_text(error.json())

    async def process_text_message(self, message: TextMessage, user: User, websocket: WebSocket) -> ResMessage:
        if message.channel_id not in self.user_channels[user.id]:
            raise ParamsError("채널이 존재하지 않음")
        msg = await create_message(db=self.db, data=message, user=user)
        user_msg = parse_obj_as(UserMessage, msg)
        res_msg = ResMessage(message=user_msg)
        return res_msg

    async def process_channel_config(self, config: ChannelConfig, user: User, websocket: WebSocket):
        if config.setting_type == ChannelConfigType.create:
            new_channel = await self.process_create_channel(
                config=config, user=user, websocket=websocket)
            channel = parse_obj_as(ChannelInfo, new_channel)
            res_msg = ResMessage(status=Status.newChannel, channel=channel)
            return res_msg
        elif config.setting_type == ChannelConfigType.modify:
            if config.channel_id not in self.user_channels[user.id]:
                raise ParamsError("채널 접근 권한이 없음")
        elif config.setting_type == ChannelConfigType.delete:
            await self.process_delete_channel(config=config, user=user, websocket=websocket)
            res_msg = ResMessage(status=Status.delChannel)
            return res_msg
        raise ParamsError("설정 에러")

    async def process_create_channel(self, config: ChannelConfig, user: User, websocket: WebSocket) -> Channel:
        channel_create = config.detail
        if not isinstance(channel_create, ChannelCreate):
            raise ParamsError("detail 잘못됨")
        if len(channel_create.name) < 2:
            raise ParamsError("채널 이름이 너무 짧음")
        server = await get_server_by_id(db=self.db, server_id=channel_create.server_id)
        server_list = await get_server_list(db=self.db, user=user)
        if server not in server_list:
            raise ParamsError("서버 접근 권한이 없음")
        new_channel = await create_channel(
            db=self.db, channel_create=channel_create, server=server)
        return new_channel

    async def process_delete_channel(self, config: ChannelConfig, user: User, websocket: WebSocket) -> None:
        if config.channel_id not in self.user_channels[user.id]:
            raise ParamsError("채널 접근 권한이 없음")
        channel = await get_channel_by_id(db=self.db, channel_id=config.channel_id)
        if not channel:
            raise ParamsError("없는 체널입니다.")
        await delete_channel(db=self.db, channel=channel)


manager = ConnectionManager()
