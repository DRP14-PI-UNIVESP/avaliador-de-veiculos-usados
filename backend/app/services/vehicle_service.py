from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "data" / "processed" / "cars_clean.csv"


class VehicleService:
    def __init__(self) -> None:
        self._df: pd.DataFrame | None = None

    def _load_data(self) -> pd.DataFrame:
        if self._df is None:
            self._df = pd.read_csv(DATA_PATH)
        return self._df

    def get_brands(self) -> list[str]:
        df = self._load_data()
        return sorted(df["brand"].unique().tolist())

    def get_models_by_brand(self, brand: str) -> list[str]:
        df = self._load_data()
        filtered = df[df["brand"] == brand.strip().lower()]
        return sorted(filtered["model"].unique().tolist())

    def get_fuel_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["fuel"].unique().tolist())

    def get_gear_types(self) -> list[str]:
        df = self._load_data()
        return sorted(df["gear"].unique().tolist())

    def get_year_range(self) -> dict[str, int]:
        df = self._load_data()
        return {
            "min": int(df["year_model"].min()),
            "max": int(df["year_model"].max()),
        }
