from sqlmodel import SQLModel,Field

class UsersBase(SQLModel):
    id : int | None = Field(default=None,primary_key=True)
    username : str = Field(unique=True)
    disabled : bool = Field(default=False)

class Users(UsersBase,table=True):
    hashed_password : str

class UserCreate(SQLModel):
    username : str
    password : str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    id: int | None = None
