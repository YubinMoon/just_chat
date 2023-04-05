from typing import Union
from pydantic import BaseModel, validator
from datetime import datetime
from domain.server.server_schema import ServerList


class BaseUser(BaseModel):
    username: str
    nickname: str

    class Config:
        orm_mode = True


class UserCreate(BaseUser):
    password1: str
    password2: str

    @validator('username', 'password1', 'password2', 'nickname', pre=True, always=True)
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Required field is empty.')
        return v

    @validator('password2')
    def passwords_match(cls, v, values):
        if 'password1' in values and v != values['password1']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class UserInfo(BaseUser):
    create_date: datetime
    settings: Union[str, None]


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str


class UserUpdate(BaseModel):
    nickname: str = ""
    password1: str = ""
    password2: str = ""

    @validator('password2')
    def passwords_match(cls, v, values):
        if values['password1'] != v:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v
