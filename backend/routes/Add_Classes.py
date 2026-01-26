from fastapi import APIRouter, HTTPException, status, Request
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.rate_limiter_deps import limiter
from backend.models import Class, ClassBase, ClassCreate


class_routes = APIRouter(tags=['Classes'])

@class_routes.get('/classes', response_model=List[ClassBase])
@limiter.limit('5/minute')
def Fetch_All_Classes(current_user: UserDep, request: Request):
    classes = current_user.classes
    if classes:
        result = []
        for c in classes:
            result.append({
                'id': c.id,
                'c_name': c.c_name,
                'r_name': c.r_name,
                'created_at': c.created_at,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.subject.subject_name,
                    'role': a.role
                } for a in c.teacher_assignments]
            })
        return result
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Classes not found!')

@class_routes.get('/classes/{id}', response_model=ClassBase)
@limiter.limit('15/minute')
def Fetch_Class(id: int, current_user: UserDep, db: SessionDep, request: Request):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        return {
                'id': cur_class.id,
                'c_name': cur_class.c_name,
                'r_name': cur_class.r_name,
                'created_at': cur_class.created_at,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.subject.subject_name,
                    'role': a.role
                } for a in cur_class.teacher_assignments]
            }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')


@class_routes.post('/classes')
@limiter.limit('10/minute')
def Add_class(classes: ClassCreate, current_user: UserDep, db: SessionDep, request: Request):
    new_class = Class(c_name=classes.c_name, r_name=classes.r_name, user_id=current_user.id)

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

<<<<<<< HEAD
    return {'message': 'Class created successfully!'}


=======
    return {
                'id': new_class.id,
                'c_name': new_class.c_name,
                'r_name': new_class.r_name,
                'created_at': new_class.created_at,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.subject.subject_name,
                    'role': a.role
                } for a in new_class.teacher_assignments]
            }

>>>>>>> bc210a9 (reverted the changes)
@class_routes.put('/classes/{id}')
@limiter.limit('10/minute')
def Update_Class(id: int, current_user: UserDep, db: SessionDep, updated_class: ClassCreate, request: Request):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        cur_class.c_name = updated_class.c_name
        cur_class.r_name = updated_class.r_name

        db.commit()
        db.refresh(cur_class)

        return {
<<<<<<< HEAD
            'message': 'Class updated successfully!'
=======
                'id': cur_class.id,
                'c_name': cur_class.c_name,
                'r_name': cur_class.r_name,
                'created_at': cur_class.created_at,
                'teacher_assignments': [{
                    'assign_id': a.id,
                    't_name': a.teacher.t_name,
                    'subject': a.subject.subject_name,
                    'role': a.role
                } for a in cur_class.teacher_assignments]
>>>>>>> bc210a9 (reverted the changes)
            }
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')


@class_routes.delete('/classes/{id}')
@limiter.limit('40/minute')
def delete_class(id: int, current_user: UserDep, db: SessionDep, request: Request):
    cur_class = db.query(Class).filter(Class.id == id, Class.user_id == current_user.id).first()
    if cur_class:
        db.delete(cur_class)
        db.commit()
        return {'message': 'class deleted successfully'}
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Class not found!')