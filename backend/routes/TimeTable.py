from fastapi import APIRouter, HTTPException, status, Request, Query
from backend.database import SessionDep
from backend.oauth import UserDep
from backend.models import Generate_Data, TeacherClassAssignment, Teacher, TimeTable, AllTimeTable, TimeTableEntry, TimeTableEntryUpdate, WeekDay, AllTimeTableBaseModel, TimeTableCreateBase
from backend.Generations.utils import Generate_Timetable
from backend.rate_limiter_deps import limiter
from typing import List, Annotated

timetable_routes = APIRouter(tags=['Generate TimeTable'])


@timetable_routes.get('/timetables', response_model=List[AllTimeTable])
def Fetch_All_timetables(current_user: UserDep, request: Request):

    timetables = current_user.timetables

    if not timetables:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No timetables found!')

    return [{
        'timetable_id': timetable.id,
        'timetable_name': timetable.timetable_name,
        'created_at': timetable.created_at
    } for timetable in timetables]




@timetable_routes.get('/timetables/{id}', response_model=AllTimeTableBaseModel)
def Fetch_One_TimeTables(current_user: UserDep, request: Request, id: int, db: SessionDep, class_name: Annotated[str | None, Query(max_length=50, description="An optional query parameter for class_name!")] = None, teacher_name: Annotated[str | None, Query(max_length=50, description="An optional query parameter for teacher_name!")] = None):
    #timetables fetching
    timetable = db.query(TimeTable).filter(TimeTable.id == id, TimeTable.user_id == current_user.id).first()

    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTables does not exist!')
    days_in_timetables = db.query(TimeTableEntry.day).filter(TimeTableEntry.timetable_id == timetable.id).distinct().all()
    list_of_days = set([d[0] for d in days_in_timetables])
    all_days = list(WeekDay)

    if class_name is None and teacher_name is None:

        class_in_timetables = db.query(TimeTableEntry.class_name).filter(TimeTableEntry.timetable_id == timetable.id).distinct().all()

        formated_assignments = [{
            'class_name': c[0],
            'assignments': [{
                'day': d,
                'assignments': []
            } for d in all_days if d in list_of_days]
            } for c in class_in_timetables]
        
        class_name_to_index = {
            c.get('class_name') : index
            for index, c in enumerate(formated_assignments)
        }

        days_to_index = {
            d.get('day'): index
            for index, d in enumerate(formated_assignments[0]['assignments'])
        }

        for entry in timetable.entries:

            formated_entry = {
                    'id': entry.id,
                    'slot': entry.slot,
                    'subject': entry.subject_name,
                    'teacher_name': entry.teacher_name,
                    'room_name': entry.room_name
                }
            
            class_index = class_name_to_index.get(entry.class_name)
            day_index = days_to_index.get(entry.day)

            formated_assignments[class_index]['assignments'][day_index]['assignments'] = formated_assignments[class_index]['assignments'][day_index].get('assignments', []) + [formated_entry]

        for c in formated_assignments:
            for assignment in c.get('assignments'):
                assignment['assignments'] = sorted(assignment.get('assignments', []), key=lambda a: a['slot'])

        return {
                'id': timetable.id,
                'name': timetable.timetable_name,
                'slots': timetable.slots,
                'assignments': formated_assignments
                }
    
    elif class_name is not None:

        class_table_entries = db.query(TimeTableEntry).filter(TimeTableEntry.timetable_id == timetable.id, TimeTableEntry.class_name == class_name).all()

        if not class_table_entries:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This class does not exist in this table!")
        
        formated_assignments = {
            'class_name': class_name,
            'assignments': [{
                'day': d,
                'assignments': []
            } for d in all_days if d in list_of_days]
        }

        days_to_index = {
            d.get('day'): index
            for index, d in enumerate(formated_assignments['assignments'])
        }

        for entry in class_table_entries:

            formated_entry = {
                'id': entry.id,
                'slot': entry.slot,
                'subject': entry.subject_name,
                'teacher_name': entry.teacher_name,
                'room_name': entry.room_name
            }

            day_index = days_to_index.get(entry.day)

            formated_assignments['assignments'][day_index]['assignments'] = formated_assignments['assignments'][day_index].get('assignments', []) + [formated_entry]

        for assignment in formated_assignments.get('assignments'):
            assignment['assignments'] = sorted(assignment.get('assignments', []), key=lambda a: a['slot'])

        return {
                'id': timetable.id,
                'name': timetable.timetable_name,
                'slots': timetable.slots,
                'assignments': formated_assignments
                }

        
    else:
        
        teacher_table_entries = db.query(TimeTableEntry).filter(TimeTableEntry.timetable_id == timetable.id, TimeTableEntry.teacher_name == teacher_name).all()


        if not teacher_table_entries:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This class does not exist in this table!")
        
        formated_assignments = {
            'teacher_name': teacher_name,
            'assignments': [{
                'day': d,
                'assignments': []
            } for d in all_days if d in list_of_days]
        }

        days_to_index = {
            d.get('day'): index
            for index, d in enumerate(formated_assignments['assignments'])
        }

        for entry in teacher_table_entries:

            formated_entry = {
                'id': entry.id,
                'slot': entry.slot,
                'subject': entry.subject_name,
                'class_name': entry.class_name,
                'room_name': entry.room_name
            }

            day_index = days_to_index.get(entry.day)

            formated_assignments['assignments'][day_index]['assignments'] = formated_assignments['assignments'][day_index].get('assignments', []) + [formated_entry]

        for assignment in formated_assignments.get('assignments'):
            assignment['assignments'] = sorted(assignment.get('assignments', []), key=lambda a: a['slot'])

        return {
                'id': timetable.id,
                'name': timetable.timetable_name,
                'slots': timetable.slots,
                'assignments': formated_assignments
                }




@timetable_routes.post('/generate', response_model=TimeTableCreateBase)
def Generate_TimeTable(current_user: UserDep, db: SessionDep, data: Generate_Data, request: Request):

    # select assignments for teachers that belong to the current user
    teacher_class_assignments = db.query(TeacherClassAssignment).join(Teacher).filter(Teacher.user_id == current_user.id).all()

    if not teacher_class_assignments:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail = 'No teacher assigned to any class!')
    
    new_timetable = Generate_Timetable(db=db, assignments=teacher_class_assignments, data=data, user_id=current_user.id)

    return new_timetable


@timetable_routes.delete('/timetables/{id}')
def Delete_TimeTable(current_user: UserDep, db: SessionDep, id: int, request: Request):

    timetable = db.query(TimeTable).filter(TimeTable.id == id, TimeTable.user_id == current_user.id).first()

    if not timetable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='TimeTable not found!')
    
    db.delete(timetable)
    db.commit()

    return {'message': 'deleted successfully'}