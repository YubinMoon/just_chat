from pydantic import BaseModel
from enum import Enum
from typing import Union
from datetime import datetime
from domain.user.user_schema import UserInfo,BaseUser



class ContentType(str, Enum):
    text = "text"
    img = "img"
    video = "video"
    voice = "voice"
    file = "file"
    
    
class BaseMessage(BaseModel):
    channel_id: int
    content_type: ContentType = ContentType.text
    content: Union[str, bytes]
    

class Message(BaseModel):
    id: int
    channel_id: int
    user: BaseUser
    content_type: ContentType = ContentType.text
    content: str
    create_date: datetime
    modify_date: datetime = None

    class Config:
        orm_mode = True


class MessageList(BaseModel):
    total: int
    message_list: list[Message]


class MessageGet(BaseModel):
    channel_id: int
    size: int
    message_id: int

