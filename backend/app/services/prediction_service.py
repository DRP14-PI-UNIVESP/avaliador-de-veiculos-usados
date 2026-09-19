from datetime import datetime

import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.schemas.vehicle import PredictionOutput, VehicleInput
from app.services.price_adjustment_service import calculate_adjustments


class PredictionService:
    def __init__(self) -> None:
        self._artifact = None

    def _load_artifact(self) -> dict:
        if self._artifact is None:
            self._artifact = joblib.load(settings.MODEL_PATH)
        return self._artifact

    def predict(self, vehicle: VehicleInput) -> PredictionOutput:
        artifact = self._load_artifact()
        model = artifact["model"]
        encoders = artifact["encoders"]
        feature_columns = artifact["feature_columns"]
        categorical_columns = artifact["categorical_columns"]

        data = vehicle.model_dump()
        data["vehicle_age"] = datetime.now().year - data["year_model"]

        # Converte enums para string antes de encodar
        for col in categorical_columns:
            if col in data and col in encoders:
                value = str(data[col].value if hasattr(data[col], "value") else data[col])
                data[col] = encoders[col].transform([value])[0]

        input_df = pd.DataFrame([{col: data[col] for col in feature_columns}])
        prediction = model.predict(input_df)
        base_price = float(np.round(prediction[0], 2))

        # Calcula ajustes baseados nas características adicionais
        adjustments, total_pct = calculate_adjustments(
            base_price, vehicle.comfort, vehicle.safety, vehicle.condition
        )
        estimated_price = round(base_price * (1 + total_pct / 100), 2)

        return PredictionOutput(
            base_price=base_price,
            estimated_price=estimated_price,
            model_used=type(model).__name__,
            adjustments=adjustments,
            total_adjustment_percent=total_pct,
        )
