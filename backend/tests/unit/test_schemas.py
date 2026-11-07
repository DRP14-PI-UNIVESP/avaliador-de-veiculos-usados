import pytest
from pydantic import ValidationError

from app.schemas.vehicle import FuelType, GearType, VehicleInput


class TestVehicleInput:
    def test_valid_input(self):
        vehicle = VehicleInput(
            brand="TOYOTA",
            model="COROLLA",
            year_model=2020,
            year_manufacture=2019,
            mileage_km=45000,
            fuel=FuelType.FLEX,
            gear=GearType.AUTOMATICA,
            body_type="Sedã",
        )
        assert vehicle.brand == "TOYOTA"
        assert vehicle.year_model == 2020

    def test_invalid_year_too_low(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="TOYOTA",
                model="COROLLA",
                year_model=1900,
                year_manufacture=1900,
                mileage_km=45000,
                fuel=FuelType.FLEX,
                gear=GearType.AUTOMATICA,
                body_type="Sedã",
            )

    def test_invalid_negative_mileage(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="TOYOTA",
                model="COROLLA",
                year_model=2020,
                year_manufacture=2019,
                mileage_km=-1000,
                fuel=FuelType.FLEX,
                gear=GearType.AUTOMATICA,
                body_type="Sedã",
            )

    def test_invalid_year_too_high(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="TOYOTA",
                model="COROLLA",
                year_model=2050,
                year_manufacture=2050,
                mileage_km=45000,
                fuel=FuelType.FLEX,
                gear=GearType.AUTOMATICA,
                body_type="Sedã",
            )

    def test_invalid_engine_cc_negative(self):
        with pytest.raises(ValidationError):
            VehicleInput(
                brand="TOYOTA",
                model="COROLLA",
                year_model=2020,
                year_manufacture=2019,
                mileage_km=45000,
                fuel=FuelType.FLEX,
                gear=GearType.AUTOMATICA,
                body_type="Sedã",
                engine_cc=-1.0,
            )
