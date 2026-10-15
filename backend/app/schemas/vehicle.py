from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class FuelType(str, Enum):
    GASOLINA = "Gasolina"
    DIESEL = "Diesel"
    FLEX = "Flex"
    ELETRICO = "Elétrico"
    HIBRIDO = "Híbrido"


class GearType(str, Enum):
    MANUAL = "Manual"
    AUTOMATICA = "Automática"
    CVT = "CVT"


class BodyType(str, Enum):
    HATCHBACK = "Hatchback"
    SEDA = "Sedã"
    SUV = "Utilitário esportivo"
    PICAPE = "Picape"
    PERUA = "Perua/SW"
    COUPE = "Cupê"
    CONVERSIVEL = "Conversível"
    VAN = "Van/Utilitário"


class DriveType(str, Enum):
    DIANTEIRA = "Dianteira"
    TRASEIRA = "Traseira"
    INTEGRAL_PARCIAL = "Integral parcial"
    INTEGRAL_PERMANENTE = "Integral permanente"


class SellerType(str, Enum):
    PF = "PF"
    PJ = "PJ"


class VehicleCondition(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class ComfortFeatures(BaseModel):
    air_conditioning: bool = False
    electric_windows: bool = False
    electric_locks: bool = False
    leather_seats: bool = False
    electric_mirrors: bool = False
    multimedia_center: bool = False
    rear_camera: bool = False
    parking_sensor: bool = False


class SafetyFeatures(BaseModel):
    airbag: bool = False
    abs_brakes: bool = False
    alarm: bool = False
    armored: bool = False


class ConditionFeatures(BaseModel):
    accident_history: bool = False
    single_owner: bool = False
    full_service_history: bool = False
    original_paint: bool = False
    condition: VehicleCondition = VehicleCondition.GOOD


class VehicleInput(BaseModel):
    brand: str = Field(..., json_schema_extra={"example": "TOYOTA"})
    model: str = Field(..., json_schema_extra={"example": "COROLLA"})
    year_model: int = Field(..., ge=1990, le=2026, json_schema_extra={"example": 2020})
    year_manufacture: int = Field(..., ge=1990, le=2026, json_schema_extra={"example": 2019})
    mileage_km: float = Field(..., ge=0, json_schema_extra={"example": 45000})
    fuel: str = Field(..., json_schema_extra={"example": "Flex"})
    gear: str = Field(..., json_schema_extra={"example": "Automática"})
    body_type: str = Field(..., json_schema_extra={"example": "Sedã"})
    drive_type: str = Field(default="", json_schema_extra={"example": "Dianteira"})
    seller_type: str = Field(default="PF", json_schema_extra={"example": "PF"})
    city: str = Field(default="", json_schema_extra={"example": "São Paulo"})
    neighborhood: str = Field(default="", json_schema_extra={"example": "Centro"})
    horsepower: float = Field(default=0, ge=0, json_schema_extra={"example": 140})
    engine_cc: float = Field(default=0, ge=0, json_schema_extra={"example": 2.0})

    comfort: ComfortFeatures = Field(default_factory=ComfortFeatures)
    safety: SafetyFeatures = Field(default_factory=SafetyFeatures)
    condition: ConditionFeatures = Field(default_factory=ConditionFeatures)


class PriceAdjustment(BaseModel):
    category: str
    item: str
    percentage: float
    value: float


class PredictionOutput(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    base_price: float = Field(..., json_schema_extra={"example": 89500.00})
    estimated_price: float = Field(..., json_schema_extra={"example": 95000.00})
    currency: str = "BRL"
    model_used: str = Field(..., json_schema_extra={"example": "HistGradientBoostingRegressor"})
    adjustments: list[PriceAdjustment] = []
    total_adjustment_percent: float = 0.0
