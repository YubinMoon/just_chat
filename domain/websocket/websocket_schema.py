from enum import Enum
from typing import Union
from pydantic import BaseModel, validator
from datetime import datetime
from domain.server.server_schema import ServerList
from domain.message.message_schema import ContentType, MessageGet, BaseMessage, UserMessage


class ChannelConfigType(str, Enum):
    create = "create"
    delete = "delete"
    modify = "modify"


class TextMessage(BaseModel):
    channel_id: int
    content_type: ContentType = ContentType.text
    content: Union[str, bytes]


class ChannelConfig(BaseModel):
    setting_type: ChannelConfigType
    channel_id: int
    detail: str = None


class InputData(BaseModel):
    text_message: TextMessage = None
    channel_config: ChannelConfig = None


class ResMessage(BaseModel):
    message: UserMessage


class ErrorMessage(BaseModel):
    detail: str


class Error(BaseModel):
    error: ErrorMessage
