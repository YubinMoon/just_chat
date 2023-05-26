from typing import Union
from pydantic import BaseModel, validator
from datetime import datetime


class BaseAge(BaseModel):
    earch: int = -1
    wil: int = -1
