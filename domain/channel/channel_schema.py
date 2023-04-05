from pydantic import BaseModel
from enum import Enum


class ChannelType(str, Enum):
    text = "text"
    gpt = "gpt"
    voice = "voice"

class BasicChannel(BaseModel):
    name: str
    description: str = ""

class BaseChannel(BasicChannel):
    type: ChannelType = ChannelType.text

class ChannelCreate(BaseChannel):
    server_id: int


class ChannelInfo(BaseChannel):
    id: int
    type: str
    name: str
    description: str

    class Config:
        orm_mode = True
