from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import SessionDep
from backend.oauth import UserDep
from backend.models import Teacher, Class, TeacherClassAssignment, TeacherClassAssignmentCreate, TeacherClassAssignmentBase, TeacherClassAssignmentUpdate

assign_routes = APIRouter(tags=['Teacher Assignment'])

@assign_routes.get('/assignments', response_model=List[TeacherClassAssignmentBase])
def fetch_all_assignments(current_user: UserDep, db: SessionDep):

    assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()
    if not assignments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No assignments found!')
    
    result = []
    for a in assignments:
        result.append({
            'id': a.id,
            'teacher_id': a.teacher_id,
            't_name': a.teacher.t_name,
            'class_id': a.class_id,
            'c_name': a.class_.c_name,
            'role': a.role,
            'subject': a.t_sub,
            'min_per_day': a.min_per_day,
            'max_per_day': a.max_per_day,
            'min_per_week': a.min_per_week,
            'max_per_week': a.max_per_week
        })
    
    return result

@assign_routes.post('/assignments')
def add_assignments(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentCreate):

    teacher = db.query(Teacher).filter_by(id=values.teacher_id, user_id=current_user.id).first()

    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Teacher or class does not exists!')
    
    cur_class = db.query(Class).filter_by(id=values.class_id, user_id=current_user.id).first()

    if not cur_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Teacher or class does not exists!')
    
    
    exist = db.query(TeacherClassAssignment).filter(TeacherClassAssignment.teacher_id == teacher.id, TeacherClassAssignment.class_id == cur_class.id).first()

    if exist:
        return {'message': 'Already Exists'}
    
    new_assignment = TeacherClassAssignment(
        teacher_id=teacher.id,
        class_id=cur_class.id,
        role=values.role,
        t_sub=values.subject,
        min_per_day=values.min_per_day,
        max_per_day=values.max_per_day,
        min_per_week=values.min_per_week,
        max_per_week=values.max_per_week
    )

    db.add(new_assignment)
    db.commit()

    return {'message': 'assigned successfully'}
    
@assign_routes.put('/assignments/{id}')
def update_assignment(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentUpdate, id: int):
    assignment = (
        db.query(TeacherClassAssignment)
        .join(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .filter(TeacherClassAssignment.id == id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='assignment not found!')

    assignment.role = values.role
    assignment.t_sub = values.subject
    assignment.min_per_day = values.min_per_day
    assignment.max_per_day = values.max_per_day
    assignment.min_per_week = values.min_per_week
    assignment.max_per_week = values.max_per_week

    db.commit()

    return {'message': 'updated successfully'}

@assign_routes.delete('/assignments/{id}')
def delete_assignment(current_user: UserDep, db: SessionDep, id: int):

    assignment = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.id == current_user.id).filter(TeacherClassAssignment.id == id).first()

    if assignment:
        db.delete(assignment)
        db.commit()

        return {'message': 'Assignment deleted successfully'}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='assignment not found!')
