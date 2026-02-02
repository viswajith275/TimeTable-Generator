from sqlalchemy import Integer, String, ForeignKey, Enum, ARRAY
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator
from typing import List, Optional, Union
from datetime import datetime
import enum
import re

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

class Hardness(enum.Enum):
    HARD = "High"
    MED = "Med"
    LOW = "Low"

class TeacherRoles(enum.Enum):
    CLASS_TEACHER = "CLASS_TEACHER"
    SUBJECT_TEACHER = "SUBJECT_TEACHER"


#Base user model
class UsersBase(BaseModel):
    username : str
    email: str
    disabled : bool

    model_config = ConfigDict(from_attributes=True)

#user create model
class UserCreate(BaseModel):
    username : str
    email: EmailStr
    password : str
    confirm_password: str

    @field_validator('username')
    @classmethod
    def username_validation(cls, u: str) -> str:
        if ' ' in u:
            raise ValueError('Username cannot contain spaces')
        if len(u) < 3 or len(u) > 20:
            raise ValueError('Length of username should be between 3 and 20')
        return u
        
    @field_validator('password')
    @classmethod
    def password_constraints(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 20:
            raise ValueError('Password must be at most 20 characters long')
        if ' ' in v:
            raise ValueError('Password must not contain a space')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v   
        
    
    @model_validator(mode='after')
    def check_password_match(self) -> 'UserCreate':
        if self.password != self.confirm_password:
            raise ValueError('Confirm password should be same as password!')
        return self
    

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
    created_at: datetime
    teacher_assignments: List[TeacherAssignedBase]

    model_config = ConfigDict(from_attributes=True)

#Returning teacher data model
class TeacherBase(BaseModel):
    id: int
    t_name: str
    max_per_week: int
    max_per_day: Optional[int]
    max_consecutive_class: Optional[int]
    created_at: datetime
    class_assignments: List[ClassAssignedBase]

    model_config = ConfigDict(from_attributes=True)

#Class creation details model
class ClassCreate(BaseModel):
    c_name: str
    r_name: str

#Teacher creation/Updation detail model
class TeacherCreate(BaseModel):
    t_name: str
    max_per_week: int
    max_per_day: Optional[int] = None
    max_consecutive_class: Optional[int] = None


class TeacherUpdate(TeacherCreate):
    pass


class SubjectBase(BaseModel):
    id: int
    subject: str
    created_at: datetime
    min_per_day: Optional[int] = None
    max_per_day: Optional[int] = None
    min_per_week: Optional[int] = None
    max_per_week: Optional[int] = None
    max_consecutive_class: Optional[int] = None
    min_consecutive_class: Optional[int] = None
    is_hard_sub: Hardness

    model_config = ConfigDict(from_attributes=True)

class SubjectCreate(BaseModel):
    subject: str
    min_per_day: Optional[int] = None
    max_per_day: Optional[int] = None
    min_per_week: Optional[int] = None
    max_per_week: Optional[int] = None
    max_consecutive_class: Optional[int] = None
    min_consecutive_class: Optional[int] = None
    is_hard_sub: Hardness

    @model_validator(mode='after')
    def max_min_validation(self) -> 'SubjectCreate':
        if self.min_per_day is not None and self.max_per_day is not None:
            if self.min_per_day > self.max_per_day:
                raise ValueError("The max value should be greater than min value!")
            
        if self.min_per_week is not None and self.max_per_week is not None:
            if self.min_per_week > self.max_per_week:
                raise ValueError("The max value should be greater than min value!")
            
        if self.min_consecutive_class is not None and self.max_consecutive_class is not None:
            if self.min_consecutive_class > self.max_consecutive_class:
                raise ValueError("The max value should be greater than min value!")
        
        return self


class SubjectUpdate(SubjectCreate):
    pass

#Teacher class assignment returning model
class TeacherClassAssignmentBase(BaseModel):
    id: int
    teacher_id: int
    created_at: datetime
    t_name: str
    class_id: int
    c_name: str
    role: str
    subject_id: int
    subject_name: str

    model_config = ConfigDict(from_attributes=True)

#Teacher class assignment creation data model
class TeacherClassAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    subject_id: int
    role: TeacherRoles
    morning_class_days: Optional[List[WeekDay]] = None

    @model_validator(mode='after')
    def validation(self) -> 'TeacherClassAssignmentCreate':

        if self.morning_class_days is not None and self.role == TeacherRoles.SUBJECT_TEACHER:
            raise ValueError("Subject teacher cant have fixed morning classes!")
        
        return self
    

#Teacher class assignment update data model
class TeacherClassAssignmentUpdate(BaseModel):
    role: TeacherRoles
    morning_class_days: Optional[List[WeekDay]]

    @model_validator(mode='after')
    def validation(self) -> 'TeacherClassAssignmentUpdate':

        if self.morning_class_days is not None and self.role == TeacherRoles.SUBJECT_TEACHER:
            raise ValueError("Subject teacher cant have fixed morning classes!")
        
        return self

#Timetable generation data model
class Generate_Data(BaseModel):
    timetable_name: str
    slots: int
    days: List[WeekDay]

#Timetable Entries of an timetable data model

class TimeTableEntryUpdate(BaseModel):
    subject: str
    teacher_name: str
    room_name: str

class ClassTimeTableEntryJson(BaseModel):
    id: int
    slot: int
    subject: str
    teacher_name: str
    room_name: str

    model_config = ConfigDict(from_attributes=True)

class TeacherTimeTableEntryJson(BaseModel):
    id: int
    slot: int
    subject: str
    class_name: str
    room_name: str

    model_config = ConfigDict(from_attributes=True)


class PerDayClassTimeTableEntryJson(BaseModel):
    day: WeekDay
    assignments: List[ClassTimeTableEntryJson]


class PerDayTeacherTimeTableEntryJson(BaseModel):
    day: WeekDay
    assignments: List[TeacherTimeTableEntryJson]


class PerClassTimetableEntryJson(BaseModel):
    class_name: str
    assignments: List[PerDayClassTimeTableEntryJson]


class PerTeacherTimeTableEntryJson(BaseModel):
    teacher_name: str
    assignments: List[PerDayTeacherTimeTableEntryJson]
    

#Timetable Return structure
class TimeTableJson(BaseModel):
    id: int
    name: str
    slots: int
    
    assignments: List[PerClassTimetableEntryJson]

    model_config = ConfigDict(from_attributes=True)

class ClassTimeTableJson(BaseModel):
    id: int
    name: str
    slots: int
    
    assignments: PerClassTimetableEntryJson

    model_config = ConfigDict(from_attributes=True)

class TeacherTimeTableJson(BaseModel):
    id: int
    name: str
    slots: int
    
    assignments: PerTeacherTimeTableEntryJson

    model_config = ConfigDict(from_attributes=True)


class TimeTableCreateBase(BaseModel):
    status: str
    timetable_id: Optional[int] = None
    error: Optional[List[str]] = None


AllTimeTableBaseModel = Union[TimeTableJson, ClassTimeTableJson, TeacherTimeTableJson]


class AllTimeTable(BaseModel):
    timetable_id: int
    timetable_name: str
    created_at: datetime

#table structures

#user table schemas
class User(Base):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())
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
    subjects: Mapped[List["Subject"]] = relationship(
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
    access_key: Mapped[Optional[str]] = mapped_column(nullable=True) #change when making access statable object
    refresh_key: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())
    expires_at: Mapped[datetime] = mapped_column()

    user: Mapped['User'] = relationship(back_populates='tokens')
 
 #Teacher table schema
class Teacher(Base):

    __tablename__ = 'teachers'

    id: Mapped[int] = mapped_column(primary_key=True)

    t_name: Mapped[str] = mapped_column(String(50))

    max_per_week: Mapped[int] = mapped_column()
    max_per_day: Mapped[Optional[int]] = mapped_column()
    max_consecutive_class: Mapped[Optional[int]] = mapped_column()
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())
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
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped['User'] = relationship(back_populates='classes')

    teacher_assignments: Mapped[List["TeacherClassAssignment"]] = relationship(
        back_populates="class_",
        cascade="all, delete-orphan"
    )

class Subject(Base):

    __tablename__ = 'subjects'

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_name: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    min_per_day: Mapped[Optional[int]] = mapped_column()
    max_per_day: Mapped[Optional[int]] = mapped_column()
    min_per_week: Mapped[Optional[int]] = mapped_column()
    max_per_week: Mapped[Optional[int]] = mapped_column()
    max_consecutive_class: Mapped[Optional[int]] = mapped_column()
    min_consecutive_class: Mapped[Optional[int]] = mapped_column()
    is_hard_sub: Mapped[str] = mapped_column(default='Low')

    subject_assignments: Mapped[List["TeacherClassAssignment"]] = relationship(back_populates="subject", cascade="all, delete-orphan")
    user: Mapped['User'] = relationship(back_populates='subjects')

#Teacher Class Assignment Table Schema
class TeacherClassAssignment(Base):

    __tablename__ = "teacher_class_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))

    role: Mapped[TeacherRoles] = mapped_column(Enum(TeacherRoles), nullable=False)  # "CLASS_TEACHER","SUBJECT_TEACHER"
    morning_class_days: Mapped[Optional[List[WeekDay]]] = mapped_column(ARRAY(Enum(WeekDay)))


    teacher: Mapped["Teacher"] = relationship(back_populates="class_assignments")
    class_: Mapped["Class"] = relationship(back_populates="teacher_assignments")
    subject: Mapped["Subject"] = relationship(back_populates="subject_assignments") 

#TimeTable Entry Table data (Assigns date and slot for teacher class assignments)
class TimeTableEntry(Base):

    __tablename__ = 'timetable_entries'

    id: Mapped[int] = mapped_column(primary_key=True)

    timetable_id: Mapped[int] = mapped_column(ForeignKey("timetables.id"))
    room_name: Mapped[str] = mapped_column()
    class_name: Mapped[str] = mapped_column()
    teacher_name: Mapped[str] = mapped_column()
    subject_name: Mapped[str] = mapped_column()


    day: Mapped[WeekDay] = mapped_column(Enum(WeekDay))
    slot: Mapped[int] = mapped_column(nullable=False)

    timetable: Mapped["TimeTable"] = relationship(back_populates='entries')

#Timetable table schema (Maps Timetable entries under a single name)
class TimeTable(Base):
    
    __tablename__ = 'timetables'

    id: Mapped[int] = mapped_column(primary_key=True)
    timetable_name: Mapped[str] = mapped_column(String(50), nullable=False)
    slots: Mapped[int] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow())

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped[User] = relationship(back_populates='timetables')
    entries: Mapped[List['TimeTableEntry']] = relationship(back_populates='timetable', cascade='all, delete-orphan')