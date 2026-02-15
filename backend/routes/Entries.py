from fastapi import APIRouter, HTTPException, status, Request
from backend.database import SessionDep
from backend.oauth import UserDep
from backend.rate_limiter_deps import limiter
from backend.models import TimeTableEntry, TimeTableEntryUpdate, TimeTable

entry_routes = APIRouter(tags=["Entries"])

@entry_routes.put('/entries/{id}')
def Update_Timetable_Entry(current_user: UserDep, db: SessionDep, id: int,entry_data: TimeTableEntryUpdate , request: Request):

    timetable_entry = db.query(TimeTableEntry).join(TimeTable).filter(TimeTableEntry.id == id).filter(TimeTable.user_id == current_user.id).first()

    if not timetable_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="timetable entry not found!")
    
    timetable_entry.teacher_name = entry_data.teacher_name
    timetable_entry.subject_name = entry_data.subject
    timetable_entry.room_name = entry_data.room_name

    db.commit()
    
    return {'message': 'Timetable entry updated successfully!'}