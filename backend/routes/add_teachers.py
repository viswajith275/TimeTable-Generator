from fastapi import APIRouter
from ..oauth2 import UserDep
from ..database import SessionDep
from ..models import User,Teacher,Class

routes = APIRouter(tags=['Insert Teachers'])

@routes.get('/teachers')
def fetch_all_teachers(current_user: UserDep):
    teachers = current_user.teachers
    if teachers:
        return teachers
    else:
        return {'error':'No teachers were added'}
    
