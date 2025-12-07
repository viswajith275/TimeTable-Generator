from sqlmodel import SQLModel, create_engine, Session, select
from fastapi import Depends
from typing import Annotated
from models import Users
from config import SQL_DATABASE_URL

engine = create_engine(SQL_DATABASE_URL)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

def get_user_by_id( user_id : int, db : Session):
    cur_user = db.exec(select(Users).where(Users.id == user_id)).first()
    return cur_user

def get_user_by_username(username : str, db : Session):
    cur_user = db.exec(select(Users).where(Users.username == username)).first()
    return cur_user