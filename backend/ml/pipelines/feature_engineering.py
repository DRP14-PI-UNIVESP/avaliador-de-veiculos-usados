"""Pipeline de engenharia de atributos."""

from datetime import datetime

import pandas as pd
from sklearn.preprocessing import LabelEncoder


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Idade do veículo
    current_year = datetime.now().year
    df["vehicle_age"] = current_year - df["year_model"]

    return df


def encode_categorical(
    df: pd.DataFrame,
    columns: list[str],
    encoders: dict[str, LabelEncoder] | None = None,
) -> tuple[pd.DataFrame, dict[str, LabelEncoder]]:
    df = df.copy()
    encoders = encoders or {}

    for col in columns:
        if col not in df.columns:
            continue

        if col not in encoders:
            encoders[col] = LabelEncoder()
            df[col] = encoders[col].fit_transform(df[col].astype(str))
        else:
            df[col] = encoders[col].transform(df[col].astype(str))

    return df, encoders
