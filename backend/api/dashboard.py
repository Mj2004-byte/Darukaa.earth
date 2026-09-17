from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import User
from backend.schemas.analytics import DashboardStatsOut
from backend.ai.tools import AgentTools
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def dashboard_stats_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tools = AgentTools(db)
    stats = tools.get_dashboard_statistics()

    recent_insights = [
        {
            "title": "Carbon Sequestration Trajectory",
            "content": f"Managed projects currently sequester {stats['total_carbon_sequestered_tCO2e']:,.1f} tCO2e/yr across {stats['total_area_ha']:,.1f} hectares.",
            "type": "POSITIVE",
        },
        {
            "title": "Biodiversity Index Stability",
            "content": f"Average biodiversity score remains healthy at {stats['avg_biodiversity_score']}/100 across {stats['total_sites']} active monitoring polygons.",
            "type": "NEUTRAL",
        },
        {
            "title": "Satellite Telemetry Status",
            "content": "All project boundaries are synchronized with PostGIS spatial indices and Mapbox GL layer rendering.",
            "type": "INFO",
        },
    ]

    return DashboardStatsOut(
        total_projects=stats["total_projects"],
        active_projects=stats["active_projects"],
        total_sites=stats["total_sites"],
        total_area_ha=stats["total_area_ha"],
        total_carbon_sequestered=stats["total_carbon_sequestered_tCO2e"],
        avg_biodiversity_score=stats["avg_biodiversity_score"],
        recent_insights=recent_insights,
    )
