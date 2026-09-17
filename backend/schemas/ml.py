from pydantic import BaseModel
from typing import Optional, Dict

class RiskPredictionRequest(BaseModel):
    site_id: str

class RiskPredictionResponse(BaseModel):
    site_id: str
    site_name: str
    risk_score: float  # 0.0 to 1.0
    risk_level: str    # Low, Moderate, High
    feature_contributions: Dict[str, float]
    ai_explanation: str
    model_version: str
    is_experimental: bool = True
