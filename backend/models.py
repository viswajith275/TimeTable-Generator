from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from pydantic import BaseModel
from typing import List

class Base(DeclarativeBase):
    pass


teacher_class_association = Table(
    "teacher_class_link",
    Base.metadata,
    Column("teacher_id", ForeignKey("teachers.id"), primary_key=True),
    Column("class_id", ForeignKey("classes.id"), primary_key=True),
)


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

class TeacherBase(BaseModel):
    pass

#table structures

class User(Base):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    disabled: Mapped[bool] = mapped_column(default=True)

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

    __tablename__ = 'clasess'

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