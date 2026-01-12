from sqlalchemy import Integer, String, ForeignKey, Enum
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime
import enum

class Base(DeclarativeBase):
    pass

class WeekDay(enum.Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"


#Base user model
class UsersBase(BaseModel):
    username : str
    email: str
    disabled : bool
    model_config = {"from_attributes": True}

#user create model
class UserCreate(BaseModel):
    username : str
    email: EmailStr
    password : str

#Teacher class relation model
class ClassAssignedBase(BaseModel):
    assign_id: int
    c_name: str
    r_name: str
    subject: str
    role: str

#class teacher relation model
class TeacherAssignedBase(BaseModel):
    assign_id: int
    t_name: str
    subject: str
    role: str

#Returning class data model
class ClassBase(BaseModel):
    id: int
    c_name: str
    r_name: str
    teacher_assignments: List[TeacherAssignedBase]

#Returning teacher data model
class TeacherBase(BaseModel):
    id: int
    t_name: str
    max_classes: int
    class_assignments: List[ClassAssignedBase]

#Class creation details model
class ClassCreate(BaseModel):
    c_name: str
    r_name: str

#Teacher creation detail model
class TeacherCreate(BaseModel):
    t_name: str
    max_classes: int

#Teacher class assignment returning model
class TeacherClassAssignmentBase(BaseModel):
    id: int
    teacher_id: int
    t_name: str
    class_id: int
    c_name: str
    role: str
    subject: str
    min_per_day: Optional[int]
    max_per_day: Optional[int]
    min_per_week: Optional[int]
    max_per_week: Optional[int]

    model_config = ConfigDict(from_attributes=True)

#Teacher class assignment creation data model
class TeacherClassAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    role: str
    subject: str
    min_per_day: Optional[int]
    max_per_day: Optional[int]
    min_per_week: Optional[int]
    max_per_week: Optional[int]

#Teacher class assignment update data model
class TeacherClassAssignmentUpdate(BaseModel):
    role: str
    subject: str
    min_per_day: Optional[int]
    max_per_day: Optional[int]
    min_per_week: Optional[int]
    max_per_week: Optional[int]

#Timetable generation data model
class Generate_Data(BaseModel):
    timetable_name: str
    slotes: int
    days: List[WeekDay]

#Timetable Entries of an timetable data model
class TimeTableEntryJson(BaseModel):
    id: int
    assign_id: int
    day: str
    slot: int
    subject: str
    teacher_name: str
    class_name: str

    model_config = ConfigDict(from_attributes=True)

#Timetable Return structure
class TimeTableJson(BaseModel):
    id: int
    name: str
    
    assignments: List[TimeTableEntryJson]

    model_config = ConfigDict(from_attributes=True)


#table structures

#user table schemas
class User(Base):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    disabled: Mapped[bool] = mapped_column(default=False)

    #relationship with teachers, class, timetables, tokens
    teachers: Mapped[List["Teacher"]] = relationship(
            back_populates="user", 
            cascade="all, delete-orphan"
        )
    
    classes: Mapped[List["Class"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    timetables: Mapped[List["TimeTable"]] = relationship(back_populates='user', cascade='all, delete-orphan')

    tokens: Mapped[List["UserToken"]] = relationship(back_populates='user', cascade='all, delete-orphan')

#User Token data dumping table (have to make a auto cleanup script to clear every week or so)
class UserToken(Base):

    __tablename__ = 'user_tokens'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    access_key: Mapped[Optional[str]] = mapped_column(nullable=True) #change when making access stateable object
    refresh_key: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())
    expires_at: Mapped[datetime] = mapped_column()

    user: Mapped['User'] = relationship(back_populates='tokens')
 
 #Teacher table schema
class Teacher(Base):

    __tablename__ = 'teachers'

    id: Mapped[int] = mapped_column(primary_key=True)
    t_name: Mapped[str] = mapped_column(String(50))
    max_classes: Mapped[int] = mapped_column(Integer, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    user: Mapped["User"] = relationship(back_populates="teachers")

    class_assignments: Mapped[List["TeacherClassAssignment"]] = relationship(
        back_populates="teacher",
        cascade="all, delete-orphan" 
    )

#Class table schema
class Class(Base):

    __tablename__ = 'classes'

    id: Mapped[int] = mapped_column(primary_key=True)
    c_name: Mapped[str] = mapped_column(String(50), nullable=False)
    r_name: Mapped[str] = mapped_column(String(50), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped['User'] = relationship(back_populates='classes')

    teacher_assignments: Mapped[List["TeacherClassAssignment"]] = relationship(
        back_populates="class_",
        cascade="all, delete-orphan"
    )

#Teacher Class Assignment Table Schema
class TeacherClassAssignment(Base):

    __tablename__ = "teacher_class_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"))

    role: Mapped[str] = mapped_column(String(30), nullable=False)  # "class_teacher","subject_teacher"
    t_sub: Mapped[str] = mapped_column(String(50), nullable=False)
    min_per_day: Mapped[Optional[int]] = mapped_column()
    max_per_day: Mapped[Optional[int]] = mapped_column()
    min_per_week: Mapped[Optional[int]] = mapped_column()
    max_per_week: Mapped[Optional[int]] = mapped_column()

    teacher: Mapped["Teacher"] = relationship(back_populates="class_assignments")
    class_: Mapped["Class"] = relationship(back_populates="teacher_assignments")
    timetable_entries: Mapped[List["TimeTableEntry"]] = relationship(back_populates="assignment")

#TimeTable Entry Table data (Assigns date and slot for teacher class assignments)
class TimeTableEntry(Base):

    __tablename__ = 'timetable_entries'

    id: Mapped[int] = mapped_column(primary_key=True)

    timetable_id: Mapped[int] = mapped_column(ForeignKey("timetables.id"))

    assignment_id: Mapped[int] = mapped_column(ForeignKey('teacher_class_assignments.id'))

    day: Mapped[WeekDay] = mapped_column(Enum(WeekDay))
    slot: Mapped[int] = mapped_column(nullable=False)

    assignment: Mapped["TeacherClassAssignment"] = relationship(back_populates="timetable_entries")
    timetable: Mapped["TimeTable"] = relationship(back_populates='entries')

#Timetable table schema (Maps Timetable entries under a single name)
class TimeTable(Base):
    
    __tablename__ = 'timetables'

    id: Mapped[int] = mapped_column(primary_key=True)
    timetable_name: Mapped[str] = mapped_column(String(50), nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped[User] = relationship(back_populates='timetables')
    entries: Mapped[List['TimeTableEntry']] = relationship(back_populates='timetable', cascade='all, delete-orphan')