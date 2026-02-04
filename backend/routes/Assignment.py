from fastapi import APIRouter, HTTPException, status, Request
from typing import List
from backend.database import SessionDep
from backend.oauth import UserDep
from backend.rate_limiter_deps import limiter
from backend.models import Teacher, Class, Subject, TeacherClassAssignment, TeacherClassAssignmentCreate, TeacherClassAssignmentBase, TeacherClassAssignmentUpdate, TeacherRoles

assign_routes = APIRouter(tags=['Teacher Assignment'])

@assign_routes.get('/assignments', response_model=List[TeacherClassAssignmentBase])
def fetch_all_assignments(current_user: UserDep, db: SessionDep, request: Request):

    assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()
    if not assignments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No assignments found!')
    
    result = []
    for a in assignments:
        result.append({
            'id': a.id,
            'created_at': a.created_at,
            'teacher_id': a.teacher_id,
            't_name': a.teacher.t_name,
            'class_id': a.class_id,
            'c_name': a.class_.c_name,
            'role': a.role,
            'morning_class_days': a.morning_class_days,
            'subject_id': a.subject_id,
            'subject_name': a.subject.subject_name,
        })
    
    return result

@assign_routes.post('/assignments', response_model=TeacherClassAssignmentBase)
def add_assignments(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentCreate, request: Request):

    teacher = db.query(Teacher).filter_by(id=values.teacher_id, user_id=current_user.id).first()

    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Teacher does not exists!')
    
    cur_class = db.query(Class).filter_by(id=values.class_id, user_id=current_user.id).first()

    if not cur_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='class does not exists!')
    
    subject = db.query(Subject).filter(Subject.user_id == current_user.id, Subject.id == values.subject_id).first()

    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='subject does not exists!')
    
    exist = db.query(TeacherClassAssignment).filter(TeacherClassAssignment.class_id == cur_class.id, TeacherClassAssignment.subject_id == subject.id).first()

    if exist:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Already exists!')
    
    if values.role == TeacherRoles.CLASS_TEACHER:

        already_class_teacher = db.query(TeacherClassAssignment).filter(TeacherClassAssignment.teacher_id == teacher.id, TeacherClassAssignment.role == TeacherRoles.CLASS_TEACHER).first()

        if already_class_teacher:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This teacher is already a class teacher!")

    
    new_assignment = TeacherClassAssignment(
        teacher_id=teacher.id,
        class_id=cur_class.id,
        subject_id=subject.id,
        role=values.role,
        morning_class_days=values.morning_class_days
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
            'id': new_assignment.id,
            'created_at': new_assignment.created_at,
            'teacher_id': new_assignment.teacher_id,
            't_name': new_assignment.teacher.t_name,
            'class_id': new_assignment.class_id,
            'c_name': new_assignment.class_.c_name,
            'role': new_assignment.role,
            'morning_class_days': new_assignment.morning_class_days,
            'subject_id': new_assignment.subject_id,
            'subject_name': new_assignment.subject.subject_name,
        }
    
@assign_routes.put('/assignments/{id}', response_model=TeacherClassAssignmentBase)
def update_assignment(current_user: UserDep, db: SessionDep, values: TeacherClassAssignmentUpdate, id: int, request: Request):
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
    assignment.morning_class_days = values.morning_class_days if values.morning_class_days is not None else None
    
    db.commit()

    return {
            'id': assignment.id,
            'created_at': assignment.created_at,
            'teacher_id': assignment.teacher_id,
            't_name': assignment.teacher.t_name,
            'class_id': assignment.class_id,
            'c_name': assignment.class_.c_name,
            'role': assignment.role,
            'morning_class_days': assignment.morning_class_days,
            'subject_id': assignment.subject_id,
            'subject_name': assignment.subject.subject_name,
        }

@assign_routes.delete('/assignments/{id}')
def delete_assignment(current_user: UserDep, db: SessionDep, id: int, request: Request):

    assignment = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).filter(TeacherClassAssignment.id == id).first()

    if assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='assignment not found!')
    
    db.delete(assignment)
    db.commit()

    return {'message': 'Assignment deleted successfully'}
