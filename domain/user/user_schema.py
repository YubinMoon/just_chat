from pydantic import BaseModel, validator


class UserCreate(BaseModel):
    username: str
    password1: str
    password2: str
    nickname: str

    @validator('username', 'password1', 'password2', 'nickname')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('필수 항목이 비어 있습니다.')
        return v

    @validator('password2')
    def passwords_match(cls, v, values):
        if 'password1' in values and v != values['password1']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class Token(BaseModel):
    access_token: str
    token_type: str
    id: str
