from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.extension import _rate_limit_exceeded_handler
from backend.rate_limiter_deps import limiter
from .routes.Auth import login_routes
from .routes.Teachers import teacher_routes
from .routes.Classes import class_routes
from .routes.Assignment import assign_routes
from .routes.TimeTable import timetable_routes
from .routes.Subjects import subject_routes
from .routes.Entries import entry_routes
from backend.database import create_db_and_tables


app = FastAPI()

app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

#starting the server and creating tables
@app.on_event('startup')
def startup():
    create_db_and_tables()

origins = ["http://localhost:5173"]

#Added the local react server to the allowlist
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

#Adds all the end points to the application
app.include_router(login_routes)
app.include_router(teacher_routes)
app.include_router(class_routes)
app.include_router(subject_routes)
app.include_router(assign_routes)
app.include_router(timetable_routes)
app.include_router(entry_routes)