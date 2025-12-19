import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime,timedelta, timezone
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from pwdlib import PasswordHash
from typing import Annotated
from fastapi import Depends, HTTPException, status
from database import get_user_by_username, get_user_by_id, SessionDep
from models import TokenData, UsersBase
from fastapi.security import OAuth2PasswordBearer

#initializing password hash and oauth2 password bearer
password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


#verifying unhashed and hashed passwords
def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

#hasing the password
def get_password_hash(password):
    return password_hash.hash(password)

#authenticating current user
def authenticate_user(db: SessionDep, username: str, password: str):
    user = get_user_by_username(db = db, username = username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

#creating an jwt token for authenticated user
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

#decoding and verifying the jwt token
async def get_current_user(db : SessionDep, token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id = user_id)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_by_id(db = db, user_id = token_data.id)
    if user is None:
        raise credentials_exception
    return user

#checking the user is not banned or revoked by the admin
async def get_current_active_user(
    current_user: Annotated[UsersBase, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

#User dedpendancy
UserDep = Annotated[UsersBase, Depends(get_current_active_user)]