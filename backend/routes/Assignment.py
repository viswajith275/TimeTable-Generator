from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.database import SessionDep
from backend.oauth2 import UserDep
from backend.models import Teacher, Class, TeacherClassAssignment, TeacherClassAssignmentCreate, TeacherClassAssignmentDelete, TeacherClassAssignmentBase

assign_routes = APIRouter(tags=['Teacher Assignment'])

@assign_routes.get('/assignments', response_model=List[TeacherClassAssignmentBase])
def fetch_all_assignments(current_user: UserDep, db: SessionDep):

    assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()
    if assignments:
        return assignments
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No assignments found!')

@assign_routes.post('/assignments')
def add_assignments(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentCreate):

    teacher = db.query(Teacher).filter_by(id=values.teacher_id, user_id=current_user.id).first()
    cur_class = db.query(Class).filter_by(id=values.class_id, user_id=current_user.id).first()

    if not teacher or not cur_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Teacher or class does not exists!')
    
    exist = db.query(TeacherClassAssignment).filter(TeacherClassAssignment.teacher_id == teacher.id, TeacherClassAssignment.class_id == cur_class.id).first()

    if exist:
        return {'message': 'Already Exists'}
    
    new_assignment = TeacherClassAssignment(
        teacher_id=teacher.id,
        class_id=cur_class.id,
        role=values.role
    )

    db.add(new_assignment)
    db.commit()

    return {'message': 'assigned successfully'}
    
@assign_routes.put('/assignments')
def update_assignment(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentCreate):
    assignment = (
        db.query(TeacherClassAssignment)
        .join(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .filter(TeacherClassAssignment.teacher_id == values.teacher_id)
        .filter(TeacherClassAssignment.class_id == values.class_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='assignment not found!')

    assignment.role = values.role

    db.commit()

    return {'message': 'updated successfully'}

@assign_routes.delete('/assignments')
def delete_assignment(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentDelete):

    assignment = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.id == current_user.id).filter(TeacherClassAssignment.teacher_id == values.teacher_id, TeacherClassAssignment.class_id == values.class_id).first()

    if assignment:
        db.delete(assignment)
        db.commit()

        return {'message': 'Assignment deleted successfully'}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='assignment not found!')
