from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.Login import login_routes
from .routes.Add_Teachers import teacher_routes
from .routes.Add_Classes import class_routes
from .routes.Assignment import assign_routes
from .routes.Generate_Table import generate_routes
from backend.database import create_db_and_tables

app = FastAPI()

#starting the server and creatin tables
@app.on_event('startup')
def startup():
    create_db_and_tables()

origins = ["http://localhost:5173"]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

app.include_router(login_routes)
app.include_router(teacher_routes)
app.include_router(class_routes)
app.include_router(assign_routes)
app.include_router(generate_routes)