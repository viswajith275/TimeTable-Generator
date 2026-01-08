from fastapi import APIRouter, HTTPException, status
from backend.database import SessionDep
from backend.oauth2 import UserDep
from backend.models import Generate_Data, TeacherClassAssignment, Teacher, TimeTableJson
from backend.Generations.utils import Generate_Timetable
from typing import List

generate_routes = APIRouter(tags=['Generate TimeTable'])


@generate_routes.get('/timetables', response_model=List[TimeTableJson])
def Fetch_All_TimeTables(current_user: UserDep, db: SessionDep):
    #timetables fetching
    timetables = current_user.timetables

    total_timetables = []

    for a in timetables:
        formatted_entries = []
        for entry in a.entries:
            formatted_entries.append({
                "id": entry.id,
                "day": entry.day,
                "slot": entry.slot,
                "teacher_name": entry.assignment.teacher.name,
                "class_name": entry.assignment.class_.name
            })

        total_timetables.append(TimeTableJson(
            id=a.id,
            name=a.timetable_name,
            assignments=formatted_entries
        ))
    
    return total_timetables
 

@generate_routes.post('/generate')
def Generate_TimeTable(current_user: UserDep, db: SessionDep, data: Generate_Data):
    teacher_class_assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.id == current_user.id).all()

    if not teacher_class_assignments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = 'No teacher assigned to any class!')
    
    new_timetable = Generate_Timetable(db=db, assignments=teacher_class_assignments, data=data, user_id=current_user.id)

    if new_timetable:
        return {'message': 'TimeTable created successfully!'}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='TimeTable is not possible!')
