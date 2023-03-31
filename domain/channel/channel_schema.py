from pydantic import BaseModel
from enum import Enum
from pydantic import BaseModel


class ChannelType(str, Enum):
    text = "text"
    gpt = "gpt"
    voice = "voice"


class ChannelCreate(BaseModel):
    name: str
    description: str = ""
    type: ChannelType = ChannelType.text
    server_id: int


class Channel(BaseModel):
    id: int
    type: str
    name: str
    description: str

    class Config:
        orm_mode = True