from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str = "Forestry"
    status: str = "ACTIVE"
    country: str = "Global"
    region: str = "Default Region"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None

class ProjectOut(ProjectBase):
    id: str
    total_area: float
    owner_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    site_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
