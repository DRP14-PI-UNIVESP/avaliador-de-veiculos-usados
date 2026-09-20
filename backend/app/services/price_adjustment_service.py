"""Serviço de ajuste de preço baseado em características adicionais do veículo."""

from app.schemas.vehicle import (
    ComfortFeatures,
    ConditionFeatures,
    PriceAdjustment,
    SafetyFeatures,
    VehicleCondition,
)

# Percentuais de ajuste baseados em pesquisa de mercado automotivo
COMFORT_ADJUSTMENTS: dict[str, tuple[str, float]] = {
    "air_conditioning": ("Ar-condicionado", 3.0),
    "electric_windows": ("Vidros elétricos", 2.0),
    "electric_locks": ("Travas elétricas", 1.5),
    "leather_seats": ("Bancos de couro", 4.0),
    "electric_mirrors": ("Retrovisores elétricos", 1.0),
    "multimedia_center": ("Central multimídia", 3.5),
    "rear_camera": ("Câmera de ré", 2.0),
    "parking_sensor": ("Sensor de estacionamento", 1.5),
}

SAFETY_ADJUSTMENTS: dict[str, tuple[str, float]] = {
    "airbag": ("Airbag", 2.5),
    "abs_brakes": ("Freios ABS", 2.0),
    "alarm": ("Alarme", 1.0),
    "armored": ("Blindagem", 25.0),
}

CONDITION_ADJUSTMENTS: dict[VehicleCondition, float] = {
    VehicleCondition.EXCELLENT: 5.0,
    VehicleCondition.GOOD: 0.0,
    VehicleCondition.FAIR: -8.0,
    VehicleCondition.POOR: -20.0,
}


def calculate_adjustments(
    base_price: float,
    comfort: ComfortFeatures,
    safety: SafetyFeatures,
    condition: ConditionFeatures,
) -> tuple[list[PriceAdjustment], float]:
    adjustments: list[PriceAdjustment] = []

    # Conforto
    for field, (label, pct) in COMFORT_ADJUSTMENTS.items():
        if getattr(comfort, field):
            adjustments.append(PriceAdjustment(
                category="Conforto",
                item=label,
                percentage=pct,
                value=round(base_price * pct / 100, 2),
            ))

    # Segurança
    for field, (label, pct) in SAFETY_ADJUSTMENTS.items():
        if getattr(safety, field):
            adjustments.append(PriceAdjustment(
                category="Segurança",
                item=label,
                percentage=pct,
                value=round(base_price * pct / 100, 2),
            ))

    # Condição do veículo
    cond_pct = CONDITION_ADJUSTMENTS[condition.condition]
    if cond_pct != 0:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item=f"Estado: {condition.condition.value}",
            percentage=cond_pct,
            value=round(base_price * cond_pct / 100, 2),
        ))

    if condition.accident_history:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Histórico de acidente",
            percentage=-12.0,
            value=round(base_price * -12.0 / 100, 2),
        ))

    if condition.single_owner:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Único dono",
            percentage=3.0,
            value=round(base_price * 3.0 / 100, 2),
        ))

    if condition.full_service_history:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Revisões em dia",
            percentage=4.0,
            value=round(base_price * 4.0 / 100, 2),
        ))

    if condition.original_paint:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Pintura original",
            percentage=3.0,
            value=round(base_price * 3.0 / 100, 2),
        ))

    total_pct = sum(a.percentage for a in adjustments)
    return adjustments, round(total_pct, 2)
