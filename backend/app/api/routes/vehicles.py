from fastapi import APIRouter

from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

vehicle_service = VehicleService()


@router.get("/brands")
async def list_brands() -> list[str]:
    return vehicle_service.get_brands()


@router.get("/brands/{brand}/models")
async def list_models(brand: str) -> list[str]:
    return vehicle_service.get_models_by_brand(brand)


@router.get("/fuels")
async def list_fuels() -> list[str]:
    return vehicle_service.get_fuel_types()


@router.get("/gears")
async def list_gears() -> list[str]:
    return vehicle_service.get_gear_types()


@router.get("/body-types")
async def list_body_types() -> list[str]:
    return vehicle_service.get_body_types()


@router.get("/drive-types")
async def list_drive_types() -> list[str]:
    return vehicle_service.get_drive_types()


@router.get("/seller-types")
async def list_seller_types() -> list[str]:
    return vehicle_service.get_seller_types()


@router.get("/cities")
async def list_cities() -> list[str]:
    return vehicle_service.get_cities()


@router.get("/cities/{city}/neighborhoods")
async def list_neighborhoods(city: str) -> list[str]:
    return vehicle_service.get_neighborhoods_by_city(city)


@router.get("/years")
async def year_range() -> dict[str, int]:
    return vehicle_service.get_year_range()
