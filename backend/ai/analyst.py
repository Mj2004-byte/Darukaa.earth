import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.db.models import Site, Analytics
from backend.ai.prompts import SITE_ANALYST_SYSTEM_PROMPT
from backend.ai.llm import call_llm
from backend.schemas.ai import SiteAnalysisResponse

def analyze_site_with_ai(site_id: str, db: Session) -> SiteAnalysisResponse:
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise ValueError(f"Site with id '{site_id}' not found.")

    # Retrieve latest analytics
    analytics_records = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.recorded_at.desc())
        .all()
    )

    if not analytics_records:
        return SiteAnalysisResponse(
            executive_summary="No environmental analytics records found for this site.",
            carbon_analysis="Information unavailable.",
            biodiversity_analysis="Information unavailable.",
            environmental_factors="Information unavailable.",
            areas_to_monitor=["No historical analytics recorded."],
            recommendations=["Initiate baseline carbon and biodiversity field monitoring."],
            is_demo_data=True,
            grounding_note="Analysis is based on demonstration data. Information unavailable.",
        )

    latest = analytics_records[0]

    # Build structured context snapshot
    dataset_snapshot = {
        "site_name": site.name,
        "project_id": site.project_id,
        "area_hectares": site.area_hectares,
        "latest_metrics": {
            "recorded_at": latest.recorded_at.isoformat(),
            "carbon_stock_tCO2e_ha": latest.carbon_stock,
            "carbon_sequestration_tCO2e_yr": latest.carbon_sequestration,
            "biodiversity_score": latest.biodiversity_score,
            "tree_cover_percentage": latest.tree_cover_percentage,
            "biomass_Mg_ha": latest.biomass,
            "rainfall_mm_yr": latest.rainfall,
            "temperature_celsius": latest.temperature,
        },
        "history_length": len(analytics_records),
    }

    user_prompt = f"Perform AI Environmental Analysis on the following site dataset snapshot:\n\n{json.dumps(dataset_snapshot, indent=2)}"

    llm_output_str = call_llm(SITE_ANALYST_SYSTEM_PROMPT, user_prompt)

    try:
        data = json.loads(llm_output_str)
        return SiteAnalysisResponse(
            executive_summary=data.get("executive_summary", "Analysis based on demonstration data."),
            carbon_analysis=data.get("carbon_analysis", "Carbon stock levels remain grounded in retrieved site data."),
            biodiversity_analysis=data.get("biodiversity_analysis", "Biodiversity index reflects recorded site trends."),
            environmental_factors=data.get("environmental_factors", "Biomass and tree cover correlate with rainfall."),
            areas_to_monitor=data.get("areas_to_monitor", ["Tree cover percentage", "Seasonal rainfall"]),
            recommendations=data.get("recommendations", ["Continue regular satellite and field telemetry monitoring."]),
            is_demo_data=True,
            grounding_note="Analysis is based on demonstration data.",
        )
    except Exception:
        return SiteAnalysisResponse(
            executive_summary="Analysis based on demonstration data. The site demonstrates stable carbon storage and healthy biodiversity indicators.",
            carbon_analysis=f"Latest carbon stock is recorded at {latest.carbon_stock} tCO2e/ha with sequestration rate of {latest.carbon_sequestration} tCO2e/yr.",
            biodiversity_analysis=f"Latest biodiversity score stands at {latest.biodiversity_score}/100 with {latest.tree_cover_percentage}% tree cover.",
            environmental_factors=f"Site experiences annual rainfall of {latest.rainfall}mm at average temperature of {latest.temperature}°C.",
            areas_to_monitor=["Tree cover canopy stability", "Biomass accumulation rate"],
            recommendations=["Maintain periodic ecological monitoring", "Expand native flora buffer zones"],
            is_demo_data=True,
            grounding_note="Analysis is based on demonstration data.",
        )
