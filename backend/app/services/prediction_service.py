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
        model = artifact["modelo"]
        encoder = artifact["encoder"]
        medianas = artifact["medianas_numericas"]
        cat_vars = artifact["variaveis_categoricas"]
        num_vars = artifact["variaveis_numericas"]
        feature_order = artifact["ordem_features"]

        current_year = datetime.now().year
        idade_veiculo = current_year - vehicle.year_model

        # Montar dicionário com os dados do veículo
        data = {
            "nome_marca": vehicle.brand,
            "nome_modelo": vehicle.model,
            "nome_combustivel": vehicle.fuel,
            "cambio": vehicle.gear,
            "carroceria": vehicle.body_type,
            "tipo_vendedor": vehicle.seller_type or "__AUSENTE__",
            "cidade": vehicle.city or "__AUSENTE__",
            "bairro": vehicle.neighborhood or "__AUSENTE__",
            "tracao": vehicle.drive_type or "__AUSENTE__",
            "ano_fabricacao": float(vehicle.year_manufacture),
            "ano_modelo": float(vehicle.year_model),
            "idade_veiculo": float(idade_veiculo),
            "quilometragem": float(vehicle.mileage_km),
            "potencia": float(vehicle.horsepower) if vehicle.horsepower > 0 else medianas.get("potencia", 0),
            "cilindrada": float(vehicle.engine_cc) if vehicle.engine_cc > 0 else medianas.get("cilindrada", 0),
        }

        # Preparar variáveis categóricas
        cat_values = []
        for col in cat_vars:
            val = str(data.get(col, "__AUSENTE__"))
            cat_values.append(val)

        cat_df = pd.DataFrame([cat_values], columns=cat_vars)
        for col in cat_vars:
            cat_df[col] = cat_df[col].astype(str)

        cat_encoded = encoder.transform(cat_df)

        # Preparar variáveis numéricas
        num_values = []
        for col in num_vars:
            val = data.get(col)
            if val is None or (isinstance(val, float) and np.isnan(val)):
                val = medianas.get(col, 0)
            num_values.append(float(val))

        num_array = np.array([num_values], dtype=np.float64)

        # Juntar features na ordem correta
        X = np.column_stack([cat_encoded, num_array])

        # Predição (modelo usa log1p, então aplicar expm1)
        y_log = model.predict(X)
        base_price = float(np.round(np.expm1(y_log[0]), 2))

        # Garantir preço positivo
        if base_price < 0:
            base_price = 0.0

        # Calcular ajustes baseados nas características adicionais
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
