from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SiteAnalysisRequest(BaseModel):
    site_id: str

class SiteAnalysisResponse(BaseModel):
    executive_summary: str
    carbon_analysis: str
    biodiversity_analysis: str
    environmental_factors: str
    areas_to_monitor: List[str]
    recommendations: List[str]
    is_demo_data: bool = True
    grounding_note: str

class CompareSitesRequest(BaseModel):
    site_a_id: str
    site_b_id: str

class CompareSitesResponse(BaseModel):
    site_a_name: str
    site_b_name: str
    metrics_comparison: Dict[str, Dict[str, Any]]
    ai_summary: str
    is_demo_data: bool = True

class AIChatRequest(BaseModel):
    message: str
    site_id: Optional[str] = None
    project_id: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    referenced_sites: Optional[List[str]] = []
    referenced_metrics: Optional[Dict[str, Any]] = {}

class AIReportRequest(BaseModel):
    site_id: str
    format: Optional[str] = "markdown"

class AIReportResponse(BaseModel):
    site_id: str
    site_name: str
    report_title: str
    report_content: str
    generated_at: str
    is_demo_data: bool = True
