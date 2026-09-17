from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
import datetime

class SiteBase(BaseModel):
    name: str
    description: Optional[str] = None
    geometry: Dict[str, Any] = Field(..., description="GeoJSON Polygon geometry dictionary")
    status: str = "ACTIVE"

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class SiteOut(SiteBase):
    id: str
    project_id: str
    area_hectares: float
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)
