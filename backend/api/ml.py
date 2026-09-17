from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Site, Analytics, User
from backend.schemas.ml import RiskPredictionRequest, RiskPredictionResponse
from backend.ml.predict import predict_environmental_risk
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/ml", tags=["Deep Learning ML"])

@router.post("/risk-prediction", response_model=RiskPredictionResponse)
def risk_prediction_endpoint(
    req: RiskPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = db.query(Site).filter(Site.id == req.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    analytics_records = (
        db.query(Analytics)
        .filter(Analytics.site_id == req.site_id)
        .order_by(Analytics.recorded_at.desc())
        .all()
    )

    latest = analytics_records[0] if analytics_records else None
    metrics = {
        "rainfall": latest.rainfall if latest else 1200.0,
        "temperature": latest.temperature if latest else 24.0,
        "tree_cover_percentage": latest.tree_cover_percentage if latest else 65.0,
        "biomass": latest.biomass if latest else 150.0,
        "carbon_stock": latest.carbon_stock if latest else 200.0,
        "biodiversity_score": latest.biodiversity_score if latest else 70.0,
        "carbon_sequestration": latest.carbon_sequestration if latest else 15.0,
    }

    prediction = predict_environmental_risk(metrics)

    # Generate GenAI explanation of PyTorch risk score based on top feature contributions
    contributions = prediction["feature_contributions"]
    top_driver = max(contributions, key=contributions.get)
    driver_name = top_driver.replace("_", " ").title()

    ai_explanation = (
        f"{driver_name} and biomass variation contributed most strongly to the PyTorch neural network's risk score of "
        f"{prediction['risk_score']} ({prediction['risk_level']} Risk Level). Note: This is an experimental AI model."
    )

    return RiskPredictionResponse(
        site_id=site.id,
        site_name=site.name,
        risk_score=prediction["risk_score"],
        risk_level=prediction["risk_level"],
        feature_contributions=prediction["feature_contributions"],
        ai_explanation=ai_explanation,
        model_version=prediction["model_version"],
        is_experimental=True,
    )
