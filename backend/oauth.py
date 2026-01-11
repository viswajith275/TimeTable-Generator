import jwt
from datetime import datetime,timedelta
from backend.config import SECRET_KEY, ALGORITHM
from pwdlib import PasswordHash
from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from backend.database import SessionDep
from backend.models import User
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

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


#creating an jwt token for authenticated user
def create_token(user_id: int, token_type: str, expires_time: timedelta = None,unique_id: str = None, secret: str = None):
    
    to_encode = {
        'uid': user_id,
        'type': token_type,
    }

    if unique_id:
        to_encode['jti'] = unique_id
    if secret:
        to_encode['secret'] = secret
    if expires_time:
        expire = datetime.utcnow() + expires_time

    to_encode.update({'exp': expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

#decoding and verifying the jwt token
async def get_current_user(request: Request, db: SessionDep):

    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not Authenticated')
    
    if token.startswith('Bearer '):
        token = token.split(' ')[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('uid')

        if user_id is None or payload.get('type') != 'access':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token Invalid')
        
        return db.query(User).filter(User.id == user_id).first()
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token Expires')
    except jwt.PyJWKError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid Token')

# checking the user is not banned or revoked by the admin
async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# User dependency: return the SQLAlchemy User instance (not the Pydantic model)
UserDep = Annotated[User, Depends(get_current_active_user)]