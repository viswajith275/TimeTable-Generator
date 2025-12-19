from sqlmodel import SQLModel, create_engine, Session, select
from fastapi import Depends
from typing import Annotated
from models import Users
from config import SQL_DATABASE_URL

engine = create_engine(SQL_DATABASE_URL)

#create database at the start of the server
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

#to create and return a session
def get_session():
    with Session(engine) as session:
        yield session

#database dependancy
SessionDep = Annotated[Session, Depends(get_session)]

#search user by id
def get_user_by_id( user_id : int, db : Session):
    cur_user = db.exec(select(Users).where(Users.id == user_id)).first()
    return cur_user

#search user by username
def get_user_by_username(username : str, db : Session):
    cur_user = db.exec(select(Users).where(Users.username == username)).first()
    return cur_user