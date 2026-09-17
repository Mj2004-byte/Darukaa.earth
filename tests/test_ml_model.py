import pytest
from backend.ml.preprocessing import extract_feature_vector, normalize_features
from backend.ml.predict import predict_environmental_risk
from backend.ml.model import EnvironmentalRiskNet

def test_environmental_risk_model_prediction():
    metrics = {
        "rainfall": 1250.0,
        "temperature": 25.0,
        "tree_cover_percentage": 75.0,
        "biomass": 180.0,
        "carbon_stock": 220.0,
        "biodiversity_score": 82.0,
        "carbon_sequestration": 18.5,
    }

    result = predict_environmental_risk(metrics)
    assert "risk_score" in result
    assert 0.0 <= result["risk_score"] <= 1.0
    assert result["risk_level"] in ["Low", "Moderate", "High"]
    assert "feature_contributions" in result
    assert sum(result["feature_contributions"].values()) > 0.9  # Total contribution sums near 100%
