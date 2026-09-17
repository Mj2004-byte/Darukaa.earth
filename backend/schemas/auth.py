from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    sub: Optional[str] = None

class UserOut(BaseModel):
    id: str
    google_sub: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime.datetime
    last_login: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
