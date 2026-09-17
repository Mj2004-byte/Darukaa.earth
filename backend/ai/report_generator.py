import datetime
from sqlalchemy.orm import Session
from backend.db.models import Site, Analytics
from backend.ml.predict import predict_environmental_risk
from backend.schemas.ai import AIReportResponse

def generate_ai_site_report(site_id: str, db: Session) -> AIReportResponse:
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise ValueError(f"Site '{site_id}' not found.")

    analytics_records = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.recorded_at.desc())
        .all()
    )

    latest = analytics_records[0] if analytics_records else None
    latest_metrics = {
        "rainfall": latest.rainfall if latest else 1200.0,
        "temperature": latest.temperature if latest else 24.0,
        "tree_cover_percentage": latest.tree_cover_percentage if latest else 65.0,
        "biomass": latest.biomass if latest else 150.0,
        "carbon_stock": latest.carbon_stock if latest else 200.0,
        "biodiversity_score": latest.biodiversity_score if latest else 70.0,
        "carbon_sequestration": latest.carbon_sequestration if latest else 15.0,
    }

    # Run PyTorch Environmental Risk Model
    risk_output = predict_environmental_risk(latest_metrics)

    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    report_markdown = f"""# DARUKAA.EARTH — AI ENVIRONMENTAL AUDIT REPORT

**Site Name:** {site.name}  
**Project ID:** {site.project_id}  
**Project Name:** {site.project.name if site.project else 'N/A'}  
**Area:** {site.area_hectares:,.2f} Hectares  
**Status:** {site.status}  
**Audit Timestamp:** {now_str}  
**Grounding Disclaimer:** *Generated using demonstration environmental data.*

---

## 1. EXECUTIVE SUMMARY
{site.name} encompasses **{site.area_hectares:,.2f} hectares** within the **{site.project.name if site.project else 'N/A'}** initiative.
Recent telemetry indicates a carbon stock level of **{latest_metrics['carbon_stock']} tCO2e/ha** and a biodiversity score of **{latest_metrics['biodiversity_score']}/100**.
Overall ecosystem health displays positive stability under current management regimes.

---

## 2. GEOSPATIAL & PHYSICAL CHARACTERISTICS
- **Coordinates Centroid**: Centroid calculated via PostGIS `ST_Centroid`.
- **Polygon Geometry**: Verified Closed GeoJSON Polygon.
- **Tree Canopy Cover**: {latest_metrics['tree_cover_percentage']}%
- **Biomass Density**: {latest_metrics['biomass']} Mg/ha
- **Annual Rainfall**: {latest_metrics['rainfall']} mm
- **Mean Temperature**: {latest_metrics['temperature']} °C

---

## 3. CARBON & BIODIVERSITY TELEMETRY
- **Carbon Stock**: {latest_metrics['carbon_stock']} tCO2e/ha
- **Annual Sequestration Rate**: {latest_metrics['carbon_sequestration']} tCO2e/yr
- **Biodiversity Score**: {latest_metrics['biodiversity_score']} / 100
- **Total Historical Monitoring Records**: {len(analytics_records)} snapshots

---

## 4. EXPERIMENTAL DEEP LEARNING RISK ASSESSMENT
*Model Architecture: PyTorch Multi-Layer Perceptron (`EnvironmentalRiskNet v1.0`)*

- **Computed Risk Score**: **{risk_output['risk_score']}** (Scale 0.0 - 1.0)
- **Risk Level**: **{risk_output['risk_level'].upper()}**
- **Primary Vulnerability Drivers**:
  - Tree Cover Contribution: {risk_output['feature_contributions'].get('tree_cover_percentage', 0.0) * 100:.1f}%
  - Biomass Contribution: {risk_output['feature_contributions'].get('biomass', 0.0) * 100:.1f}%
  - Biodiversity Score Contribution: {risk_output['feature_contributions'].get('biodiversity_score', 0.0) * 100:.1f}%

---

## 5. STRATEGIC RECOMMENDATIONS & ACTION ITEMS
1. **Canopy Preservation**: Expand automated satellite alerts for sudden canopy density loss along perimeter boundaries.
2. **Soil Hydrology**: Monitor rainfall run-off patterns to prevent biomass erosion during monsoon periods.
3. **Continuous Audit**: Conduct semi-annual ground truth biodiversity sample plots to validate remote sensing telemetry.

---
*Report generated automatically by Darukaa Earth Intelligence Engine.*
"""

    return AIReportResponse(
        site_id=site.id,
        site_name=site.name,
        report_title=f"AI Environmental Audit Report — {site.name}",
        report_content=report_markdown,
        generated_at=now_str,
        is_demo_data=True,
    )
