from fastapi import APIRouter, status, HTTPException, Request
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.rate_limiter_deps import limiter
from backend.models import Teacher,TeacherCreate, TeacherBase

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
                'max_classes': t.max_classes,
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
                'max_classes': teacher.max_classes,
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
    teacher = Teacher(t_name=new_teacher.t_name, max_classes=new_teacher.max_classes, user_id=current_user.id)

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return {
                'id': teacher.id,
                't_name': teacher.t_name,
                'created_at': teacher.created_at,
                'max_classes': teacher.max_classes,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.subject.subject_name,
                    'role': c.role
                } for c in teacher.class_assignments]
                    
            }

@teacher_routes.put('/teachers/{id}', response_model=TeacherBase)
def update_teacher(id: int, current_user: UserDep, db: SessionDep, teacher: TeacherCreate, request: Request):
    updated_teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()
    if updated_teacher:
        updated_teacher.t_name = teacher.t_name
        updated_teacher.max_classes = teacher.max_classes

        db.commit()
        db.refresh(updated_teacher)

        return {
                'id': updated_teacher.id,
                'created_at': updated_teacher.created_at,
                't_name': updated_teacher.t_name,
                'max_classes': updated_teacher.max_classes,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.subject.subject_name,
                    'role': c.role
                } for c in updated_teacher.class_assignments]
                    
            }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")

@teacher_routes.delete('/teachers/{id}')
def delete_teacher(id: int, current_user: UserDep, db: SessionDep, request: Request):
    teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()
    if teacher:
        db.delete(teacher)
        db.commit()
        return {'message': 'Teacher deleted successfully'}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")