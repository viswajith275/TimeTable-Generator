from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from pydantic import BaseModel
from typing import List

class Base(DeclarativeBase):
    pass

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


class TeacherBase(BaseModel):
    id: int
    t_name: str
    t_sub: str
    max_classes: int
    class_assignments: List[ClassBase]

class ClassCreate(BaseModel):
    c_name: str

class TeacherCreate(BaseModel):
    t_name: str
    t_sub: str
    max_classes: int

class TeacherClassAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    role: str

class TeacherClassAssignmentBase(BaseModel):
    t_id: int
    t_name: str
    t_sub: str
    c_id: str
    c_name: str
    role: str

class TeacherClassAssignmentDelete(BaseModel):
    teacher_id: int
    class_id: int

#table structures

class User(Base):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    disabled: Mapped[bool] = mapped_column(default=False)

    #relationship with user and teachers
    teachers: Mapped[List["Teacher"]] = relationship(
            back_populates="user", 
            cascade="all, delete-orphan"
        )
    
    classes: Mapped[List["Class"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )
 
class Teacher(Base):

    __tablename__ = 'teachers'

    id: Mapped[int] = mapped_column(primary_key=True)
    t_name: Mapped[str] = mapped_column(String(50))
    t_sub: Mapped[str] = mapped_column(String(50), nullable=False)
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
    c_name: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped['User'] = relationship(back_populates='classes')

    teacher_assignments: Mapped[List["TeacherClassAssignment"]] = relationship(
        back_populates="class_",
        cascade="all, delete-orphan"
    )


class TeacherClassAssignment(Base):

    __tablename__ = "teacher_class_assignments"

    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), primary_key=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"), primary_key=True)
    role: Mapped[str] = mapped_column(String(30))  # "class_teacher","subject_teacher"
    teacher: Mapped["Teacher"] = relationship(back_populates="class_assignments")
    class_: Mapped["Class"] = relationship(back_populates="teacher_assignments")