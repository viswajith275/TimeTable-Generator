from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from database import SessionDep, get_user_by_username
from fastapi.security import OAuth2PasswordRequestForm
from oauth2 import authenticate_user, create_access_token, get_password_hash
from models import Token, UserCreate, Users, UsersBase

#creating a login route
routes = APIRouter(tags=['login'])

#login endpoint
@routes.post('/login',response_model=Token)
async def login_for_access_token(db : SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    #authenticating current user
    user = authenticate_user(db=db, username = form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"id": user.id}
    )
    #returning jwt token for the user
    return Token(access_token=access_token, token_type="bearer")

#sigh up endpoint
@routes.post('/register', response_model=UsersBase)
def register_user(db : SessionDep, user: UserCreate):

    #checking if useer with same username already exists
    if get_user_by_username(db = db, username=user.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = 'username already exists')
    
    #creating a new user
    hashed_password = get_password_hash(password=user.password)
    new_user = Users(username=user.username, hashed_password=hashed_password)

    #adding user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    #return new user details
    return new_user

