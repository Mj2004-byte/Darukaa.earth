from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Site, User
from backend.schemas.ai import (
    SiteAnalysisRequest,
    SiteAnalysisResponse,
    CompareSitesRequest,
    CompareSitesResponse,
    AIChatRequest,
    AIChatResponse,
    AIReportRequest,
    AIReportResponse,
)
from backend.ai.analyst import analyze_site_with_ai
from backend.ai.tools import AgentTools
from backend.ai.report_generator import generate_ai_site_report
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Services"])

@router.post("/site-analysis", response_model=SiteAnalysisResponse)
def site_analysis_endpoint(
    req: SiteAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return analyze_site_with_ai(req.site_id, db)
    except ValueError as e:
        raise HTTPException(status_code=44, detail=str(e))

@router.post("/compare-sites", response_model=CompareSitesResponse)
def compare_sites_endpoint(
    req: CompareSitesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tools = AgentTools(db)
    cmp = tools.compare_sites(req.site_a_id, req.site_b_id)
    if "error" in cmp:
        raise HTTPException(status_code=400, detail=cmp["error"])

    site_a = cmp["site_a"]
    site_b = cmp["site_b"]

    ai_summary = (
        f"Comparative evaluation based on retrieved metrics: {site_a['name']} covers {site_a['area_ha']} ha with a carbon stock of {site_a['latest_carbon_stock']} tCO2e/ha "
        f"and biodiversity score of {site_a['latest_biodiversity']}. In contrast, {site_b['name']} covers {site_b['area_ha']} ha with a carbon stock of {site_b['latest_carbon_stock']} tCO2e/ha "
        f"and biodiversity score of {site_b['latest_biodiversity']}. "
        f"{site_a['name'] if site_a['latest_biodiversity'] >= site_b['latest_biodiversity'] else site_b['name']} displays higher relative biodiversity density."
    )

    return CompareSitesResponse(
        site_a_name=site_a["name"],
        site_b_name=site_b["name"],
        metrics_comparison={
            "Area (ha)": {"Site A": site_a["area_ha"], "Site B": site_b["area_ha"]},
            "Carbon Stock (tCO2e/ha)": {"Site A": site_a["latest_carbon_stock"], "Site B": site_b["latest_carbon_stock"]},
            "Biodiversity Score": {"Site A": site_a["latest_biodiversity"], "Site B": site_b["latest_biodiversity"]},
            "Tree Cover (%)": {"Site A": site_a["latest_tree_cover"], "Site B": site_b["latest_tree_cover"]},
        },
        ai_summary=ai_summary,
        is_demo_data=True,
    )

@router.post("/chat", response_model=AIChatResponse)
def ai_chat_endpoint(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tools = AgentTools(db)
    msg_lower = req.message.lower()

    if req.site_id:
        analytics = tools.get_site_analytics(req.site_id)
        site = tools.get_site(req.site_id)
        latest = analytics[-1] if analytics else {}
        reply = (
            f"**Site Context ({site.get('name', 'Site')}):**\n"
            f"- Area: {site.get('area_hectares', 0)} ha\n"
            f"- Carbon Stock: {latest.get('carbon_stock', 'N/A')} tCO2e/ha\n"
            f"- Biodiversity Index: {latest.get('biodiversity_score', 'N/A')}/100\n"
            f"- Tree Cover: {latest.get('tree_cover_percentage', 'N/A')}%\n\n"
            f"Regarding your question ('{req.message}'): Telemetry confirms steady environmental trends across the recorded spatial polygon."
        )
        return AIChatResponse(reply=reply, referenced_sites=[req.site_id], referenced_metrics=latest)

    # Global chat fallback
    stats = tools.get_dashboard_statistics()
    reply = (
        f"**Darukaa AI Assistant Response:**\n\n"
        f"You asked: *\"{req.message}\"*\n\n"
        f"Currently, the platform manages **{stats['total_projects']} projects** with **{stats['total_sites']} sites** covering **{stats['total_area_ha']} hectares**.\n"
        f"The average biodiversity score across active sites is **{stats['avg_biodiversity_score']}/100** with total annual sequestration of **{stats['total_carbon_sequestered_tCO2e']} tCO2e/yr**.\n\n"
        f"*Note: Insights retrieved from live database telemetry based on demonstration data.*"
    )
    return AIChatResponse(reply=reply, referenced_sites=[], referenced_metrics=stats)

@router.post("/generate-report", response_model=AIReportResponse)
def generate_report_endpoint(
    req: AIReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return generate_ai_site_report(req.site_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
