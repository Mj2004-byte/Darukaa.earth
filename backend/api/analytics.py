from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Analytics, Site, User
from backend.schemas.analytics import AnalyticsOut
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/sites", tags=["Analytics"])

@router.get("/{site_id}/analytics", response_model=List[AnalyticsOut])
def get_site_analytics(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    analytics = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.recorded_at.asc())
        .all()
    )
    return [AnalyticsOut.model_validate(a) for a in analytics]
