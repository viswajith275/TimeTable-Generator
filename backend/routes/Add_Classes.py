from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.models import Class, ClassBase, ClassCreate


class_routes = APIRouter(tags=['Classes'])

@class_routes.get('/classes', response_model=List[ClassBase])
def Fetch_All_Classes(current_user: UserDep):
    classes = current_user.classes
    if classes:
        result = []
        for c in classes:
            result.append({
                'id': c.id,
                'c_name': c.c_name,
                'r_name': c.r_name,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.t_sub,
                    'role': a.role
                } for a in c.teacher_assignments]
            })
        return result
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Classes not found!')

@class_routes.get('/classes/{id}', response_model=ClassBase)
def Fetch_Class(id: int, current_user: UserDep, db: SessionDep):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        return {
                'id': cur_class.id,
                'c_name': cur_class.c_name,
                'r_name': cur_class.r_name,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.t_sub,
                    'role': a.role
                } for a in cur_class.teacher_assignments]
            }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')


@class_routes.post('/classes', response_model=ClassBase)
def Add_class(classes: ClassCreate, current_user: UserDep, db: SessionDep):
    new_class = Class(c_name=classes.c_name, r_name=classes.r_name, user_id=current_user.id)

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return new_class


@class_routes.put('/classes/{id}', response_model=ClassBase)
def Update_Class(id: int, current_user: UserDep, db: SessionDep, updated_class: ClassCreate):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        cur_class.c_name = updated_class.c_name
        cur_class.r_name = updated_class.r_name
        db.commit()
        db.refresh(cur_class)
        return cur_class
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')


@class_routes.delete('/classes/{id}')
def delete_class(id: int, current_user: UserDep, db: SessionDep):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        db.delete(cur_class)
        db.commit()
        return {'message': 'class deleted successfully'}
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')