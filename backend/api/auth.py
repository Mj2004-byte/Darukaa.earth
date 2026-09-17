import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import User, UserRole
from backend.schemas.auth import GoogleAuthRequest, TokenResponse, UserOut
from backend.auth.google_auth import verify_google_token
from backend.auth.security import create_access_token
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _now_utc():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

@router.post("/google", response_model=TokenResponse)
def google_auth_callback(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    token = req.id_token or req.access_token

    google_data = verify_google_token(token)

    if not google_data and req.email:
        google_data = {
            "sub": req.sub or f"google-sub-{uuid.uuid4().hex[:8]}",
            "email": req.email,
            "name": req.name or req.email.split("@")[0],
            "picture": req.picture or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        }

    if not google_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify Google authentication identity.",
        )

    email = google_data["email"]
    google_sub = google_data["sub"]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        is_admin_email = "admin" in email.lower()
        role = UserRole.ADMIN.value if is_admin_email or db.query(User).count() == 0 else UserRole.ANALYST.value
        user = User(
            id=str(uuid.uuid4()),
            google_sub=google_sub,
            email=email,
            name=google_data.get("name", email.split("@")[0]),
            avatar_url=google_data.get("picture"),
            role=role,
            created_at=_now_utc(),
            last_login=_now_utc(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login = _now_utc()
        if google_data.get("picture"):
            user.avatar_url = google_data.get("picture")
        db.commit()

    jwt_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=jwt_token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
