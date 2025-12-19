from sqlmodel import SQLModel,Field


#Base user model
class UsersBase(SQLModel):
    id : int | None = Field(default=None,primary_key=True)
    username : str = Field(unique=True)
    disabled : bool = Field(default=False)

#table structure
class Users(UsersBase,table=True):
    hashed_password : str

#user create model
class UserCreate(SQLModel):
    username : str
    password : str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    id: int | None = None
