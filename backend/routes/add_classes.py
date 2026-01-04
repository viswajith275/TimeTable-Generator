from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.oauth2 import UserDep
from backend.database import SessionDep
from backend.models import Class, ClassBase, ClassCreate


class_routes = APIRouter(tags=['Classes'])

@class_routes.get('/classes', response_model=List[ClassBase])
def Fetch_All_Classes(current_user: UserDep):
    classes = current_user.classes
    if classes:
        return classes
    

@class_routes.get('/classes/{id}', response_model=ClassBase)
def Fetch_Class(id: int, current_user: UserDep, db: SessionDep):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        return cur_class
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')

