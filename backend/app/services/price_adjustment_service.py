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
    "air_conditioning": ("Ar-condicionado", 2.0),
    "electric_windows": ("Vidros elétricos", 1.0),
    "electric_locks": ("Travas elétricas", 0.5),
    "leather_seats": ("Bancos de couro", 2.0),
    "electric_mirrors": ("Retrovisores elétricos", 0.5),
    "multimedia_center": ("Central multimídia", 2.0),
    "rear_camera": ("Câmera de ré", 1.0),
    "parking_sensor": ("Sensor de estacionamento", 1.0),
}

SAFETY_ADJUSTMENTS: dict[str, tuple[str, float]] = {
    "airbag": ("Airbag", 1.5),
    "abs_brakes": ("Freios ABS", 1.0),
    "alarm": ("Alarme", 0.5),
    "armored": ("Blindagem", 15.0),
}

CONDITION_ADJUSTMENTS: dict[VehicleCondition, float] = {
    VehicleCondition.EXCELLENT: 3.0,
    VehicleCondition.GOOD: 0.0,
    VehicleCondition.FAIR: -5.0,
    VehicleCondition.POOR: -12.0,
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
            percentage=-7.0,
            value=round(base_price * -7.0 / 100, 2),
        ))

    if condition.single_owner:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Único dono",
            percentage=2.0,
            value=round(base_price * 2.0 / 100, 2),
        ))

    if condition.full_service_history:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Revisões em dia",
            percentage=2.0,
            value=round(base_price * 2.0 / 100, 2),
        ))

    if condition.original_paint:
        adjustments.append(PriceAdjustment(
            category="Condição",
            item="Pintura original",
            percentage=1.5,
            value=round(base_price * 1.5 / 100, 2),
        ))

    total_pct = sum(a.percentage for a in adjustments)
    return adjustments, round(total_pct, 2)
