from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends
from typing import Annotated
from backend.models import User, Base
from backend.config import SQL_DATABASE_URL

if not SQL_DATABASE_URL:
    raise RuntimeError("SQL_DATABASE_URL is not set. Please set it in the environment or in a .env file.")

engine = create_engine(SQL_DATABASE_URL, future=True)


# create database at the start of the server
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# to create and return a session
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# database dependency type usable in route signatures
SessionDep = Annotated[Session, Depends(get_session)]


# helper: search user by id
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# helper: search user by username
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()