from pydantic import BaseModel

from domain.channel.channel_schema import ChannelInfo


class BaseServer(BaseModel):
    name: str = ""
    description: str = ""


class ServerDetail(BaseServer):
    id: int
    channel_list: list[ChannelInfo] = []  # 채널 리스트를 포함

    class Config:
        orm_mode = True


class ServerList(BaseModel):
    total: int
    server_list: list[ServerDetail]


class ServerUpdate(BaseServer):
    id: int

class InviteToken(BaseModel):
    invite_token: str