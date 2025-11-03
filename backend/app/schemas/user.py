from pydantic import BaseModel
from uuid import UUID

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    uid: UUID

    class Config:
        orm_mode = True

class UserResponse(UserBase):
    uid: UUID

    class Config:
        orm_mode = True

class ReplyIn(BaseModel):
    content: str