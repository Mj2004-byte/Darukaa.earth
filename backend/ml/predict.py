import os
import numpy as np
from typing import Dict, Any
from backend.ml.model import EnvironmentalRiskNet, HAS_TORCH
from backend.ml.preprocessing import (
    extract_feature_vector,
    normalize_features,
    calculate_feature_contributions,
)

if HAS_TORCH:
    import torch

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pt")
_model_instance = None

def get_risk_model() -> EnvironmentalRiskNet:
    global _model_instance
    if _model_instance is None:
        model = EnvironmentalRiskNet(input_dim=7)
        if os.path.exists(MODEL_PATH) and HAS_TORCH:
            try:
                model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
                model.eval()
            except Exception as e:
                print(f"Loading PyTorch artifact failed, using initial model: {e}")
        _model_instance = model
    return _model_instance

def predict_environmental_risk(metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Runs Deep Learning model inference on environmental metrics vector.
    """
    raw_vector = extract_feature_vector(metrics)
    norm_vector = normalize_features(raw_vector)

    model = get_risk_model()

    if HAS_TORCH:
        model.eval()
        with torch.no_grad():
            x_tensor = torch.tensor([norm_vector], dtype=torch.float32)
            risk_score_tensor = model(x_tensor)
            risk_score = float(risk_score_tensor.item())
    else:
        out = model.forward(norm_vector)
        risk_score = float(out[0, 0])

    # Categorize risk level
    if risk_score <= 0.33:
        risk_level = "Low"
    elif risk_score <= 0.66:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    contributions = calculate_feature_contributions(raw_vector, norm_vector)

    model_name = "PyTorch EnvironmentalRiskNet v1.0 (Experimental)" if HAS_TORCH else "NumPy NeuralNet EnvironmentalRisk v1.0 (Experimental)"

    return {
        "risk_score": round(risk_score, 3),
        "risk_level": risk_level,
        "feature_contributions": contributions,
        "model_version": model_name,
    }
