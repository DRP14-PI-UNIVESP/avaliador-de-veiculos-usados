from fastapi import APIRouter, HTTPException

from app.schemas.vehicle import PredictionOutput, VehicleInput
from app.services.prediction_service import PredictionService

router = APIRouter(tags=["prediction"])

prediction_service = PredictionService()


@router.post("/predict", response_model=PredictionOutput)
async def predict_price(vehicle: VehicleInput) -> PredictionOutput:
    try:
        return prediction_service.predict(vehicle)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Modelo de ML ainda não treinado.",
        )
