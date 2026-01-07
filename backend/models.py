from sqlalchemy import Integer, String, ForeignKey, Enum
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from pydantic import BaseModel
from typing import List
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
    disabled : bool
    model_config = {"from_attributes": True}

#user create model
class UserCreate(BaseModel):
    username : str
    password : str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    id: int | None = None


class ClassBase(BaseModel):
    id: int
    c_name: str
    r_name: str


class TeacherBase(BaseModel):
    id: int
    t_name: str
    max_classes: int
    class_assignments: List[ClassBase]

class ClassCreate(BaseModel):
    c_name: str
    r_name: str

class TeacherCreate(BaseModel):
    t_name: str
    max_classes: int

class TeacherClassAssignmentBase(BaseModel):
    teacher_id: int
    t_name: str
    class_id: int
    c_name: str
    role: str
    subject: str

class TeacherClassAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    role: str
    subject: str

class TeacherClassAssignmentDelete(BaseModel):
    teacher_id: int
    class_id: int

class Generate_Data(BaseModel):
    timetable_name: str
    slotes: int
    days: List[WeekDay]


#table structures

class User(Base):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    disabled: Mapped[bool] = mapped_column(default=False)

    #relationship with teachers, class, timetables
    teachers: Mapped[List["Teacher"]] = relationship(
            back_populates="user", 
            cascade="all, delete-orphan"
        )
    
    classes: Mapped[List["Class"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    timetables: Mapped[List["TimeTable"]] = relationship(back_populates='user')
 
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


class TeacherClassAssignment(Base):

    __tablename__ = "teacher_class_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"))

    role: Mapped[str] = mapped_column(String(30))  # "class_teacher","subject_teacher"
    t_sub: Mapped[str] = mapped_column(String(50), nullable=False)

    teacher: Mapped["Teacher"] = relationship(back_populates="class_assignments")
    class_: Mapped["Class"] = relationship(back_populates="teacher_assignments")
    timetable: Mapped[List["TimeTable"]] = relationship(back_populates='assignment') 

class TimeTableEntry(Base):

    __tablename__ = 'timetable_entries'

    id: Mapped[int] = mapped_column(primary_key=True)

    timetable_id: Mapped[int] = mapped_column(ForeignKey("timetables.id"))

    assignment_id: Mapped[int] = mapped_column(ForeignKey('teacher_class_assignments.id'))

    day: Mapped[WeekDay] = mapped_column(Enum(WeekDay))
    slotes: Mapped[int] = mapped_column(nullable=False)

    assignment: Mapped["TeacherClassAssignment"] = relationship(back_populates="timetable")
    timetable: Mapped["TimeTable"] = relationship(back_populates='entries')


class TimeTable(Base):
    
    __tablename__ = 'timetables'

    id: Mapped[int] = mapped_column(primary_key=True)
    timetable_name: Mapped[str] = mapped_column(String(50), nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped[User] = relationship(back_populates='timetables')
    entries: Mapped[List['TimeTableEntry']] = relationship(back_populates='timetable', cascade='all, delete-orphan')