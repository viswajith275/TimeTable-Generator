from fastapi import APIRouter, HTTPException, status
from backend.database import SessionDep
from backend.oauth2 import UserDep
from backend.models import Generate_Data, TeacherClassAssignment, Teacher
from Generations.utils import Generate_Timetable

generate_routes = APIRouter(tags=['Generate TimeTable'])


@generate_routes.get('/timetables')
def Fetch_All_TimeTables(current_user: UserDep, db: SessionDep):
    
    timetables = current_user.timetables

    #just convert timetables to json files


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
