from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import Annotated
from sqlalchemy import or_
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from backend.oauth import create_token, get_password_hash, verify_password, decode_token, UserDep
from backend.models import UserCreate, User, UsersBase, UserToken
from backend.database import SessionDep
from backend.rate_limiter_deps import limiter
import secrets

#creating a login route
login_routes = APIRouter(tags=['Authentication'])

#sigh up endpoint
@login_routes.post('/register', response_model=UsersBase)
@limiter.limit('10/minute')
def register_user(db: SessionDep, user: UserCreate, request: Request):
    exists = db.query(User).filter(or_(User.username == user.username, User.email == user.email)).first()

    #checking if the user exists
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username or email already registered!')
    
    hashed_pass = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pass, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

#login endpoint
@login_routes.post('/login', response_model=UsersBase)
@limiter.limit('10/minute')
async def login_for_access_token(db: SessionDep,response: Response , form_data: Annotated[OAuth2PasswordRequestForm, Depends()], request: Request):
    
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Incorrect username or password!')
    
    session_secret = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    token = UserToken(user_id=user.id, expires_at=expires_at, refresh_key=session_secret)

    db.add(token)
    db.commit()
    db.refresh(token)

    access_token = create_token(
        user_id=user.id,
        token_type='access',
        expires_time=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_token(
        user_id=user.id,
        token_type='refresh',
        expires_time=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        unique_id=str(token.id),
        secret=session_secret
    )

    response.set_cookie(
        key='access_token', value=f"Bearer {access_token}", httponly=True, secure=False, samesite="lax"
    )

    response.set_cookie(
        key='refresh_token', value=refresh_token, httponly=True, secure=False, samesite="lax"
    )

    return user

#refreshing the access and refresh tokens
@login_routes.post('/refresh')
@limiter.limit('3/15minute')
def refresh_tokens(request: Request, response: Response, db: SessionDep):
    
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token is missing!')
    
    try:
        payload = decode_token(refresh_token)

        token_type = payload.get('type')
        user_id = payload.get('uid')
        secret = payload.get('secret')

        if token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'Invalid Token {token_type}')
        
        token_id = int(payload.get('jti'))

        token = db.query(UserToken).filter(UserToken.id == token_id).first()

        if not token or token.refresh_key != secret:
            #token may be stolen
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token revoked or Invalid')
        
        session_secret = secrets.token_urlsafe(32)
        
        new_expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        new_token = UserToken(user_id=user_id, expires_at=new_expires_at, refresh_key=session_secret)

        db.add(new_token)
        db.commit()
        db.refresh(new_token)

        access_token = create_token(
            user_id=user_id,
            token_type='access',
            expires_time=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        refresh_token = create_token(
            user_id=user_id,
            token_type="refresh",
            expires_time=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            unique_id=str(new_token.id),
            secret=session_secret
        )

        response.set_cookie(
            key='access_token', value=f"Bearer {access_token}", httponly=True, secure=False, samesite="lax"
        )

        response.set_cookie(
            key='refresh_token', value=refresh_token, httponly=True, secure=False ,samesite="lax"
        )

        return {'message': 'Token refreshed'}
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid Token')


@login_routes.post('/logout')
@limiter.limit('50/15minute')
def logout_user(request: Request, response: Response, db: SessionDep):

    refresh_token = request.cookies.get('refresh_token')

    if refresh_token:
    
        payload = decode_token(refresh_token)
        token_id = int(payload.get('jti'))

        db.query(UserToken).filter(UserToken.id == token_id).delete()
        db.commit()
        
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')

    return {'message': "Logged out successfully"}

@login_routes.get('/username')
def fetch_username(current_user: UserDep):
    return {'username': current_user.username}