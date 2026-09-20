from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class FuelType(str, Enum):
    GASOLINE = "gasoline"
    DIESEL = "diesel"
    ALCOHOL = "alcohol"
    FLEX = "flex"


class GearType(str, Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"


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
    brand: str = Field(..., json_schema_extra={"example": "fiat"})
    model: str = Field(..., json_schema_extra={"example": "uno 1.0"})
    year_model: int = Field(..., ge=1985, le=2026, json_schema_extra={"example": 2018})
    mileage_km: float = Field(..., ge=0, json_schema_extra={"example": 45000})
    fuel: FuelType = Field(..., json_schema_extra={"example": "gasoline"})
    gear: GearType = Field(..., json_schema_extra={"example": "manual"})
    engine_size: float = Field(..., gt=0, json_schema_extra={"example": 1.0})

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
    model_used: str = Field(..., json_schema_extra={"example": "XGBRegressor"})
    adjustments: list[PriceAdjustment] = []
    total_adjustment_percent: float = 0.0
