from fastapi import APIRouter, status, HTTPException, Request
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.rate_limiter_deps import limiter
from backend.models import Teacher,TeacherCreate, TeacherBase, TeacherUpdate

teacher_routes = APIRouter(tags=['Teachers'])

@teacher_routes.get('/teachers', response_model=List[TeacherBase])
def fetch_all_teachers(current_user: UserDep, request: Request):
    teachers = current_user.teachers
    if teachers:
        result = []
        for t in teachers:
            result.append({
                'id': t.id,
                't_name': t.t_name,
                'created_at': t.created_at,
                'max_per_day': t.max_per_day,
                'max_consecutive_class': t.max_consecutive_class,
                'max_per_week': t.max_per_week,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.subject.subject_name,
                    'role': c.role
                } for c in t.class_assignments]
                    
            })
        return result
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teachers not found!")

@teacher_routes.get('/teachers/{id}', response_model=TeacherBase)
def fetch_teacher(id: int, current_user: UserDep, db: SessionDep, request: Request):
    teacher = db.query(Teacher).filter(Teacher.id == id and Teacher.user_id == current_user.id).first()
    if teacher:
        return {
                'id': teacher.id,
                't_name': teacher.t_name,
                'created_at': teacher.created_at,
                'max_per_day': teacher.max_per_day,
                'max_consecutive_class': teacher.max_consecutive_class,
                'max_per_week': teacher.max_per_week,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.subject.subject_name,
                    'role': c.role
                } for c in teacher.class_assignments]
                    
            }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")
    
    
@teacher_routes.post('/teachers', response_model=TeacherBase)
def add_teacher(current_user: UserDep, new_teacher: TeacherCreate, db: SessionDep, request: Request):

    exists = db.query(Teacher).filter(Teacher.t_name == new_teacher.t_name, Teacher.user_id == current_user.id).first()

    if exists:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher already exists!")

    teacher = Teacher(t_name=new_teacher.t_name, max_per_week=new_teacher.max_per_week, max_per_day=new_teacher.max_per_day, max_consecutive_class=new_teacher.max_consecutive_class, user_id=current_user.id)

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return {
            'id': teacher.id,
            't_name': teacher.t_name,
            'created_at': teacher.created_at,
            'max_per_day': teacher.max_per_day,
            'max_consecutive_class': teacher.max_consecutive_class,
            'max_per_week': teacher.max_per_week,
            'class_assignments': [{
                'assign_id': c.id,
                'c_name': c.class_.c_name,
                'r_name': c.class_.r_name,
                'subject': c.subject.subject_name,
                'role': c.role
            } for c in teacher.class_assignments]
                    
            }

@teacher_routes.put('/teachers/{id}', response_model=TeacherBase)
def update_teacher(id: int, current_user: UserDep, db: SessionDep, teacher: TeacherUpdate, request: Request):

    updated_teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()

    if not updated_teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")

    updated_teacher.t_name = teacher.t_name
    updated_teacher.max_per_week = teacher.max_per_week
    updated_teacher.max_per_day=teacher.max_per_day
    updated_teacher.max_consecutive_class=teacher.max_consecutive_class
                    

    db.commit()
    db.refresh(updated_teacher)

    return {
            'id': updated_teacher.id,
            'created_at': updated_teacher.created_at,
            't_name': updated_teacher.t_name,
            'max_per_day': updated_teacher.max_per_day,
            'max_consecutive_class': updated_teacher.max_consecutive_class,
            'max_per_week': updated_teacher.max_per_week,
            'class_assignments': [{
                'assign_id': c.id,
                'c_name': c.class_.c_name,
                'r_name': c.class_.r_name,
                'subject': c.subject.subject_name,
                'role': c.role
            } for c in updated_teacher.class_assignments]
                    
        }

@teacher_routes.delete('/teachers/{id}')
def delete_teacher(id: int, current_user: UserDep, db: SessionDep, request: Request):

    teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()

    if teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")
    
    db.delete(teacher)
    db.commit()

    return {'message': 'Teacher deleted successfully'}