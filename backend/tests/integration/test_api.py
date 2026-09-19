from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_ok(self):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestVehiclesEndpoints:
    def test_list_brands(self):
        response = client.get("/api/v1/vehicles/brands")
        assert response.status_code == 200
        brands = response.json()
        assert isinstance(brands, list)
        assert len(brands) > 0

    def test_list_fuels(self):
        response = client.get("/api/v1/vehicles/fuels")
        assert response.status_code == 200
        fuels = response.json()
        assert "gasoline" in fuels

    def test_list_gears(self):
        response = client.get("/api/v1/vehicles/gears")
        assert response.status_code == 200
        gears = response.json()
        assert "manual" in gears
        assert "automatic" in gears

    def test_year_range(self):
        response = client.get("/api/v1/vehicles/years")
        assert response.status_code == 200
        data = response.json()
        assert "min" in data
        assert "max" in data
        assert data["min"] < data["max"]

    def test_models_by_brand(self):
        response = client.get("/api/v1/vehicles/brands/fiat/models")
        assert response.status_code == 200
        models = response.json()
        assert isinstance(models, list)
        assert len(models) > 0


class TestPredictionEndpoint:
    def test_predict_basic(self):
        response = client.post(
            "/api/v1/predict",
            json={
                "brand": "fiat",
                "model": "uno 1.0",
                "year_model": 2018,
                "mileage_km": 50000,
                "fuel": "gasoline",
                "gear": "manual",
                "engine_size": 1.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["base_price"] > 0
        assert data["estimated_price"] > 0
        assert data["currency"] == "BRL"
        assert data["adjustments"] == []
        assert abs(data["base_price"] - data["estimated_price"]) < 0.1

    def test_predict_with_extras(self):
        response = client.post(
            "/api/v1/predict",
            json={
                "brand": "fiat",
                "model": "uno 1.0",
                "year_model": 2018,
                "mileage_km": 50000,
                "fuel": "gasoline",
                "gear": "manual",
                "engine_size": 1.0,
                "comfort": {
                    "air_conditioning": True,
                    "electric_windows": True,
                    "electric_locks": False,
                    "leather_seats": False,
                    "electric_mirrors": False,
                    "multimedia_center": False,
                    "rear_camera": False,
                    "parking_sensor": False,
                },
                "safety": {"airbag": True, "abs_brakes": False, "alarm": False, "armored": False},
                "condition": {
                    "accident_history": False,
                    "single_owner": True,
                    "full_service_history": False,
                    "original_paint": True,
                    "condition": "good",
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["estimated_price"] > data["base_price"]
        assert len(data["adjustments"]) > 0
        assert data["total_adjustment_percent"] > 0

    def test_predict_accident_reduces_price(self):
        response = client.post(
            "/api/v1/predict",
            json={
                "brand": "fiat",
                "model": "uno 1.0",
                "year_model": 2018,
                "mileage_km": 50000,
                "fuel": "gasoline",
                "gear": "manual",
                "engine_size": 1.0,
                "condition": {
                    "accident_history": True,
                    "single_owner": False,
                    "full_service_history": False,
                    "original_paint": False,
                    "condition": "poor",
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["estimated_price"] < data["base_price"]
        assert data["total_adjustment_percent"] < 0

    def test_predict_invalid_fuel(self):
        response = client.post(
            "/api/v1/predict",
            json={
                "brand": "fiat",
                "model": "uno",
                "year_model": 2018,
                "mileage_km": 50000,
                "fuel": "flex",
                "gear": "manual",
                "engine_size": 1.0,
            },
        )
        assert response.status_code == 422

    def test_predict_missing_fields(self):
        response = client.post(
            "/api/v1/predict",
            json={"brand": "fiat"},
        )
        assert response.status_code == 422
