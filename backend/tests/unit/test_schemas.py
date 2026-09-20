import pytest
from pydantic import ValidationError

from app.schemas.vehicle import FuelType, GearType, VehicleInput


class TestVehicleInput:
    def test_valid_input(self):
        vehicle = VehicleInput(
            brand="fiat",
            model="uno 1.0",
            year_model=2018,
            mileage_km=50000,
            fuel=FuelType.GASOLINE,
            gear=GearType.MANUAL,
            engine_size=1.0,
        )
        assert vehicle.brand == "fiat"
        assert vehicle.year_model == 2018

    def test_invalid_year_too_low(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="fiat",
                model="uno",
                year_model=1900,
                mileage_km=50000,
                fuel=FuelType.GASOLINE,
                gear=GearType.MANUAL,
                engine_size=1.0,
            )

    def test_invalid_negative_mileage(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="fiat",
                model="uno",
                year_model=2020,
                mileage_km=-1000,
                fuel=FuelType.GASOLINE,
                gear=GearType.MANUAL,
                engine_size=1.0,
            )

    def test_invalid_fuel_type(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="fiat",
                model="uno",
                year_model=2020,
                mileage_km=50000,
                fuel="flex",
                gear=GearType.MANUAL,
                engine_size=1.0,
            )

    def test_invalid_engine_size_zero(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="fiat",
                model="uno",
                year_model=2020,
                mileage_km=50000,
                fuel=FuelType.GASOLINE,
                gear=GearType.MANUAL,
                engine_size=0,
            )
