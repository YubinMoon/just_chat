from fastapi import WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models import User, Channel
from domain.channel.channel_crud import get_channel_list_by_user


class ConnectionManager:
    def __init__(self):
        # dict[channel_id, dict[user_id, WebSocket]]
        self.channels: dict[int, dict[int, WebSocket]] = {}
        # dict[user_id, list[channel_id]]
        self.users: dict[int, list[int]] = {}

    async def connect(self, db: AsyncSession, user: User, websocket: WebSocket):
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
        for channel_id in self.users[user.id]:
            del self.channels[channel_id]
        del self.users[user.id]
        print(f"{user.nickname} is disconnected")

    async def broadcast(self, user: User, message: str):
        for user_id, websocket in self.channels[user.id].items():
            await websocket.send_json(message)


manager = ConnectionManager()
