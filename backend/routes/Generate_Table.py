from fastapi import APIRouter, HTTPException, status
from backend.database import SessionDep
from backend.oauth2 import UserDep
from backend.models import Generate_Data, TeacherClassAssignment, Teacher, TimeTableJson, TimeTable
from backend.Generations.utils import Generate_Timetable
from typing import List

generate_routes = APIRouter(tags=['Generate TimeTable'])


@generate_routes.get('/timetables', response_model=List[TimeTableJson])
def Fetch_All_TimeTables(current_user: UserDep, db: SessionDep):
    #timetables fetching
    timetables = current_user.timetables

    if not timetables:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTables does not exist!')

    total_timetables = []

    for a in timetables:
        formatted_entries = []
        for entry in a.entries:
            formatted_entries.append({
                'id': entry.id,
                'assign_id': entry.assignment_id,
                'day': entry.day,
                'slot': entry.slot,
                'subject': entry.assignment.t_sub,
                'teacher_name': entry.assignment.teacher.t_name,
                'class_name':  entry.assignment.class_.c_name
            })

        total_timetables.append({
            'id': a.id,
            'name': a.timetable_name,
            'assignments': formatted_entries
        })
    
    return total_timetables
 

@generate_routes.post('/generate')
def Generate_TimeTable(current_user: UserDep, db: SessionDep, data: Generate_Data):

    # select assignments for teachers that belong to the current user
    teacher_class_assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()

    if not teacher_class_assignments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = 'No teacher assigned to any class!')
    
    new_timetable = Generate_Timetable(db=db, assignments=teacher_class_assignments, data=data, user_id=current_user.id)

    if new_timetable:
        return {'message': 'TimeTable created successfully!'}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='TimeTable is not possible!')


@generate_routes.delete('/timetables/{id}')
def Delete_TimeTable(current_user: UserDep, db: SessionDep, id: int):

    timetable = db.query(TimeTable).filter(TimeTable.id == id, TimeTable.user_id == current_user.id).first()

    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTable not found!')
    
    db.delete(timetable)
    db.commit()

    return {'message': 'deleted successfully'}