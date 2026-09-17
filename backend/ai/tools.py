from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.models import Project, Site, Analytics, RiskPrediction
from backend.ml.predict import predict_environmental_risk

class AgentTools:
    """Controlled backend tools exposed to Darukaa Earth Intelligence Agent."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_projects(self) -> List[Dict[str, Any]]:
        projects = self.db.query(Project).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "project_type": p.project_type,
                "status": p.status,
                "country": p.country,
                "total_area": p.total_area,
                "site_count": len(p.sites),
            }
            for p in projects
        ]

    def get_project(self, project_id: str) -> Dict[str, Any]:
        p = self.db.query(Project).filter(Project.id == project_id).first()
        if not p:
            return {"error": f"Project '{project_id}' not found."}
        return {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "project_type": p.project_type,
            "status": p.status,
            "country": p.country,
            "region": p.region,
            "total_area": p.total_area,
            "site_count": len(p.sites),
        }

    def get_sites(self, project_id: str = None) -> List[Dict[str, Any]]:
        query = self.db.query(Site)
        if project_id:
            query = query.filter(Site.project_id == project_id)
        sites = query.all()
        return [
            {
                "id": s.id,
                "project_id": s.project_id,
                "name": s.name,
                "area_hectares": s.area_hectares,
                "status": s.status,
            }
            for s in sites
        ]

    def get_site(self, site_id: str) -> Dict[str, Any]:
        s = self.db.query(Site).filter(Site.id == site_id).first()
        if not s:
            return {"error": f"Site '{site_id}' not found."}
        return {
            "id": s.id,
            "project_id": s.project_id,
            "project_name": s.project.name if s.project else "Unknown",
            "name": s.name,
            "description": s.description,
            "area_hectares": s.area_hectares,
            "status": s.status,
            "geometry_type": s.geometry.get("type") if s.geometry else "Polygon",
        }

    def get_site_analytics(self, site_id: str) -> List[Dict[str, Any]]:
        analytics = (
            self.db.query(Analytics)
            .filter(Analytics.site_id == site_id)
            .order_by(Analytics.recorded_at.asc())
            .all()
        )
        return [
            {
                "recorded_at": a.recorded_at.isoformat(),
                "carbon_stock": a.carbon_stock,
                "carbon_sequestration": a.carbon_sequestration,
                "biodiversity_score": a.biodiversity_score,
                "tree_cover_percentage": a.tree_cover_percentage,
                "biomass": a.biomass,
                "rainfall": a.rainfall,
                "temperature": a.temperature,
            }
            for a in analytics
        ]

    def calculate_site_area(self, site_id: str) -> Dict[str, Any]:
        s = self.db.query(Site).filter(Site.id == site_id).first()
        if not s:
            return {"error": f"Site '{site_id}' not found."}
        return {
            "site_id": s.id,
            "name": s.name,
            "calculated_area_ha": round(s.area_hectares, 2),
            "unit": "hectares",
        }

    def compare_sites(self, site_a_id: str, site_b_id: str) -> Dict[str, Any]:
        site_a = self.get_site(site_a_id)
        site_b = self.get_site(site_b_id)
        if "error" in site_a or "error" in site_b:
            return {"error": "One or both sites invalid."}

        analytics_a = self.get_site_analytics(site_a_id)
        analytics_b = self.get_site_analytics(site_b_id)

        latest_a = analytics_a[-1] if analytics_a else {}
        latest_b = analytics_b[-1] if analytics_b else {}

        return {
            "site_a": {
                "name": site_a["name"],
                "area_ha": site_a["area_hectares"],
                "latest_carbon_stock": latest_a.get("carbon_stock", 0),
                "latest_biodiversity": latest_a.get("biodiversity_score", 0),
                "latest_tree_cover": latest_a.get("tree_cover_percentage", 0),
            },
            "site_b": {
                "name": site_b["name"],
                "area_ha": site_b["area_hectares"],
                "latest_carbon_stock": latest_b.get("carbon_stock", 0),
                "latest_biodiversity": latest_b.get("biodiversity_score", 0),
                "latest_tree_cover": latest_b.get("tree_cover_percentage", 0),
            },
        }

    def get_dashboard_statistics(self) -> Dict[str, Any]:
        total_projects = self.db.query(Project).count()
        active_projects = self.db.query(Project).filter(Project.status == "ACTIVE").count()
        total_sites = self.db.query(Site).count()
        
        total_area = self.db.query(func.sum(Site.area_hectares)).scalar() or 0.0
        
        # Calculate sum of latest sequestration across sites
        latest_analytics = self.db.query(Analytics).order_by(Analytics.recorded_at.desc()).all()
        carbon_seq_sum = sum(a.carbon_sequestration for a in latest_analytics[:total_sites]) if latest_analytics else 0.0
        avg_bio = (sum(a.biodiversity_score for a in latest_analytics[:total_sites]) / max(1, min(total_sites, len(latest_analytics)))) if latest_analytics else 0.0

        return {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_sites": total_sites,
            "total_area_ha": round(total_area, 2),
            "total_carbon_sequestered_tCO2e": round(carbon_seq_sum, 2),
            "avg_biodiversity_score": round(avg_bio, 1),
        }

    def get_carbon_trend(self, site_id: str) -> Dict[str, Any]:
        analytics = self.get_site_analytics(site_id)
        if not analytics:
            return {"error": "No analytics records found."}
        first = analytics[0]
        latest = analytics[-1]
        change = latest["carbon_stock"] - first["carbon_stock"]
        pct_change = (change / first["carbon_stock"] * 100) if first["carbon_stock"] > 0 else 0.0
        return {
            "site_id": site_id,
            "initial_score": first["carbon_stock"],
            "latest_score": latest["carbon_stock"],
            "absolute_change": round(change, 2),
            "percentage_change": round(pct_change, 2),
            "period": f"{first['recorded_at'][:10]} to {latest['recorded_at'][:10]}",
        }

    def get_biodiversity_trend(self, site_id: str) -> Dict[str, Any]:
        analytics = self.get_site_analytics(site_id)
        if not analytics:
            return {"error": "No analytics records found."}
        first = analytics[0]
        latest = analytics[-1]
        change = latest["biodiversity_score"] - first["biodiversity_score"]
        pct_change = (change / first["biodiversity_score"] * 100) if first["biodiversity_score"] > 0 else 0.0
        return {
            "site_id": site_id,
            "initial_score": first["biodiversity_score"],
            "latest_score": latest["biodiversity_score"],
            "absolute_change": round(change, 2),
            "percentage_change": round(pct_change, 2),
            "period": f"{first['recorded_at'][:10]} to {latest['recorded_at'][:10]}",
        }
