"""Pipeline de carregamento e preparação inicial dos dados."""

from pathlib import Path

import pandas as pd


RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def load_raw_data(filename: str = "fipe_cars.csv") -> pd.DataFrame:
    filepath = RAW_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(
            f"Dataset não encontrado em {filepath}. "
            "Baixe o dataset do Kaggle e coloque na pasta data/raw/."
        )
    return pd.read_csv(filepath)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Remove duplicatas
    df = df.drop_duplicates()

    # Remove linhas com valores nulos nas colunas essenciais
    essential_columns = ["brand", "model", "year_model", "avg_price_brl"]
    df = df.dropna(subset=essential_columns)

    # Remove preços inválidos (zero ou negativos)
    df = df[df["avg_price_brl"] > 0]

    # Padroniza texto
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].str.strip().str.lower()

    return df.reset_index(drop=True)


def save_processed_data(df: pd.DataFrame, filename: str = "cars_clean.csv") -> Path:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    filepath = PROCESSED_DIR / filename
    df.to_csv(filepath, index=False)
    return filepath


def run_pipeline(raw_filename: str = "fipe_cars.csv") -> pd.DataFrame:
    print("Carregando dados brutos...")
    df = load_raw_data(raw_filename)
    print(f"  {len(df)} registros carregados.")

    print("Limpando dados...")
    df = clean_data(df)
    print(f"  {len(df)} registros após limpeza.")

    output_path = save_processed_data(df)
    print(f"Dados processados salvos em {output_path}")

    return df


if __name__ == "__main__":
    run_pipeline()
