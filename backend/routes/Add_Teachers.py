from fastapi import APIRouter, status, HTTPException
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.models import Teacher,TeacherCreate, TeacherBase

teacher_routes = APIRouter(tags=['Teachers'])

@teacher_routes.get('/teachers', response_model=List[TeacherBase])
def fetch_all_teachers(current_user: UserDep):
    teachers = current_user.teachers
    if teachers:
        result = []
        for t in teachers:
            result.append({
                'id': t.id,
                't_name': t.t_name,
                'max_classes': t.max_classes,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.t_sub,
                    'role': c.role
                } for c in t.class_assignments]
                    
            })
        return result
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teachers not found!")

@teacher_routes.get('/teachers/{id}', response_model=TeacherBase)
def fetch_teacher(id: int, current_user: UserDep, db: SessionDep):
    teacher = db.query(Teacher).filter(Teacher.id == id and Teacher.user_id == current_user.id).first()
    if teacher:
        return {
                'id': teacher.id,
                't_name': teacher.t_name,
                'max_classes': teacher.max_classes,
                'class_assignments': [{
                    'assign_id': c.id,
                    'c_name': c.class_.c_name,
                    'r_name': c.class_.r_name,
                    'subject': c.t_sub,
                    'role': c.role
                } for c in teacher.class_assignments]
                    
            }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")
    
    
@teacher_routes.post('/teachers', response_model=TeacherBase)
def add_teacher(current_user: UserDep, new_teacher: TeacherCreate, db: SessionDep):
    teacher = Teacher(t_name=new_teacher.t_name, max_classes=new_teacher.max_classes, user_id=current_user.id)

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher

@teacher_routes.put('/teachers/{id}', response_model=TeacherBase)
def update_teacher(id: int, current_user: UserDep, db: SessionDep, teacher: TeacherCreate):
    updated_teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()
    if updated_teacher:
        updated_teacher.t_name = teacher.t_name
        updated_teacher.max_classes = teacher.max_classes

        db.commit()
        db.refresh(updated_teacher)

        return updated_teacher
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")

@teacher_routes.delete('/teachers/{id}')
def delete_teacher(id: int, current_user: UserDep, db: SessionDep):
    teacher = db.query(Teacher).filter(Teacher.id == id, Teacher.user_id == current_user.id).first()
    if teacher:
        db.delete(teacher)
        db.commit()
        return {'message': 'deleted successfully'}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found!")