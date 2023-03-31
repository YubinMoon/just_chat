from pydantic import BaseModel

from domain.channel.channel_schema import Channel


class Server(BaseModel):
    id: int
    name: str
    description: str
    channel_list: list[Channel] = []  # 채널 리스트를 포함

    class Config:
        orm_mode = True


class ServerCreate(BaseModel):
    name: str
    description: str = ""


class ServerList(BaseModel):
    total: int
    server_list: list[Server]
