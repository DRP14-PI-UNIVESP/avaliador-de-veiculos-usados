from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "data" / "processed" / "webmotors_ouro.parquet"


class VehicleService:
    def __init__(self) -> None:
        self._df: pd.DataFrame | None = None

    def _load_data(self) -> pd.DataFrame:
        if self._df is None:
            self._df = pd.read_parquet(DATA_PATH)
        return self._df

    def get_brands(self) -> list[str]:
        df = self._load_data()
        return sorted(df["nome_marca"].dropna().unique().tolist())

    def get_models_by_brand(self, brand: str) -> list[str]:
        df = self._load_data()
        filtered = df[df["nome_marca"] == brand.strip()]
        return sorted(filtered["nome_modelo"].dropna().unique().tolist())

    def get_fuel_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["nome_combustivel"].dropna().unique().tolist())

    def get_gear_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["cambio"].dropna().unique().tolist())

    def get_body_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["carroceria"].dropna().unique().tolist())

    def get_drive_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["tracao"].dropna().unique().tolist())

    def get_seller_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["tipo_vendedor"].dropna().unique().tolist())

    def get_cities(self) -> list[str]:
        df = self._load_data()
        return sorted(df["cidade"].dropna().unique().tolist())

    def get_neighborhoods_by_city(self, city: str) -> list[str]:
        df = self._load_data()
        filtered = df[df["cidade"] == city.strip()]
        return sorted(filtered["bairro"].dropna().unique().tolist())

    def get_year_range(self) -> dict[str, int]:
        df = self._load_data()
        return {
            "min": int(df["ano_modelo"].min()),
            "max": int(df["ano_modelo"].max()),
        }
