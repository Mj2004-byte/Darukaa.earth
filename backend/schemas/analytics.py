from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
import datetime

class AnalyticsOut(BaseModel):
    id: str
    site_id: str
    recorded_at: datetime.datetime
    carbon_stock: float
    carbon_sequestration: float
    biodiversity_score: float
    tree_cover_percentage: float
    biomass: float
    rainfall: float
    temperature: float

    model_config = ConfigDict(from_attributes=True)

class DashboardStatsOut(BaseModel):
    total_projects: int
    active_projects: int
    total_sites: int
    total_area_ha: float
    total_carbon_sequestered: float
    avg_biodiversity_score: float
    recent_insights: List[Dict[str, str]]
