from fastapi import APIRouter, HTTPException, status, Request
from backend.database import SessionDep
from backend.oauth import UserDep
from backend.models import Generate_Data, TeacherClassAssignment, Teacher, TimeTableJson, TimeTable, AllTimeTable
from backend.Generations.utils import Generate_Timetable
from backend.rate_limiter_deps import limiter
from typing import List

generate_routes = APIRouter(tags=['Generate TimeTable'])


@generate_routes.get('/timetables', response_model=List[AllTimeTable])
def Fetch_All_timetables(current_user: UserDep, request: Request):

    timetables = current_user.timetables

    if not timetables:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No timetables found!')

    return [{
        'timetable_id': timetable.id,
        'timetable_name': timetable.timetable_name,
        'created_at': timetable.created_at
    } for timetable in timetables]




@generate_routes.get('/timetables/{id}', response_model=TimeTableJson)
def Fetch_One_TimeTables(current_user: UserDep, request: Request, id: int, db: SessionDep):
    #timetables fetching
    timetable = db.query(TimeTable).filter(TimeTable.id == id, TimeTable.user_id == current_user.id).first()

    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTables does not exist!')

    return {
            'id': timetable.id,
            'name': timetable.timetable_name,
            'assignments': [{
                
                'id': entry.id,
                'assign_id': entry.assignment_id,
                'day': entry.day,
                'slot': entry.slot,
                'subject': entry.assignment.subject.subject_name,
                'teacher_name': entry.assignment.teacher.t_name,
                'class_name':  entry.assignment.class_.c_name

            } for entry in timetable.entries]
            }
    
    
 

@generate_routes.post('/generate')
def Generate_TimeTable(current_user: UserDep, db: SessionDep, data: Generate_Data, request: Request):

    # select assignments for teachers that belong to the current user
    teacher_class_assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()

    if not teacher_class_assignments:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail = 'No teacher assigned to any class!')
    
    new_timetable = Generate_Timetable(db=db, assignments=teacher_class_assignments, data=data, user_id=current_user.id)

    if new_timetable:
        return {'message': 'TimeTable created successfully!'}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='TimeTable is not possible!')


@generate_routes.delete('/timetables/{id}')
def Delete_TimeTable(current_user: UserDep, db: SessionDep, id: int, request: Request):

    timetable = db.query(TimeTable).filter(TimeTable.id == id, TimeTable.user_id == current_user.id).first()

    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTable not found!')
    
    db.delete(timetable)
    db.commit()

    return {'message': 'deleted successfully'}