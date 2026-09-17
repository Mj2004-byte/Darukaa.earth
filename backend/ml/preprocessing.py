import numpy as np
from typing import Dict, List, Tuple

# Domain feature normalization bounds (mean and standard deviation)
FEATURE_KEYS = [
    "rainfall",
    "temperature",
    "tree_cover_percentage",
    "biomass",
    "carbon_stock",
    "biodiversity_score",
    "carbon_sequestration",
]

FEATURE_STATS = {
    "rainfall": {"mean": 1200.0, "std": 400.0},
    "temperature": {"mean": 24.0, "std": 5.0},
    "tree_cover_percentage": {"mean": 65.0, "std": 20.0},
    "biomass": {"mean": 150.0, "std": 50.0},
    "carbon_stock": {"mean": 200.0, "std": 80.0},
    "biodiversity_score": {"mean": 70.0, "std": 15.0},
    "carbon_sequestration": {"mean": 15.0, "std": 5.0},
}

def extract_feature_vector(metrics: Dict[str, float]) -> List[float]:
    """Extract raw 7-dimensional feature vector from analytics dictionary."""
    return [
        float(metrics.get("rainfall", 1200.0)),
        float(metrics.get("temperature", 24.0)),
        float(metrics.get("tree_cover_percentage", 65.0)),
        float(metrics.get("biomass", 150.0)),
        float(metrics.get("carbon_stock", 200.0)),
        float(metrics.get("biodiversity_score", 70.0)),
        float(metrics.get("carbon_sequestration", 15.0)),
    ]

def normalize_features(raw_vector: List[float]) -> np.ndarray:
    """Z-score normalization of 7 environmental features."""
    norm_vector = []
    for i, key in enumerate(FEATURE_KEYS):
        val = raw_vector[i]
        mean = FEATURE_STATS[key]["mean"]
        std = FEATURE_STATS[key]["std"]
        norm_val = (val - mean) / (std if std > 0 else 1.0)
        norm_vector.append(norm_val)
    return np.array(norm_vector, dtype=np.float32)

def calculate_feature_contributions(raw_vector: List[float], norm_vector: np.ndarray) -> Dict[str, float]:
    """
    Computes directional vulnerability contribution per feature for GenAI explanation.
    Higher percentage means the feature contributes more to the risk score.
    """
    contributions = {}
    # Lower tree cover, biomass, carbon, biodiversity, sequestration increase risk
    # Extreme temperatures / low rainfall increase risk
    weights = {
        "tree_cover_percentage": -0.25,
        "biomass": -0.20,
        "biodiversity_score": -0.20,
        "carbon_stock": -0.15,
        "carbon_sequestration": -0.10,
        "rainfall": -0.05,
        "temperature": 0.05,
    }

    raw_scores = {}
    for i, key in enumerate(FEATURE_KEYS):
        w = weights[key]
        raw_val = norm_vector[i]
        # Calculate risk stress
        risk_stress = max(0.0, raw_val * w if w > 0 else -raw_val * abs(w))
        raw_scores[key] = float(risk_stress)

    total_stress = sum(raw_scores.values()) + 1e-6
    for key in FEATURE_KEYS:
        contributions[key] = round(raw_scores[key] / total_stress, 3)

    return contributions
