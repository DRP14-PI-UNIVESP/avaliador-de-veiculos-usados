"""Pipeline de treinamento e avaliação dos modelos de regressão."""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

from ml.pipelines.feature_engineering import create_features

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

TARGET = "avg_price_brl"

FEATURE_COLUMNS = [
    "brand",
    "fuel",
    "gear",
    "engine_size",
    "year_model",
    "vehicle_age",
]

CATEGORICAL_COLUMNS = ["brand", "fuel", "gear"]


def load_processed_data() -> pd.DataFrame:
    filepath = PROCESSED_DIR / "cars_clean.csv"
    if not filepath.exists():
        raise FileNotFoundError(
            "Dados processados não encontrados. Execute data_loader.py primeiro."
        )
    return pd.read_csv(filepath)


def prepare_data(
    df: pd.DataFrame,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, dict[str, LabelEncoder]]:
    df = create_features(df)

    # Remove outliers extremos de preço (IQR)
    q1 = df[TARGET].quantile(0.25)
    q3 = df[TARGET].quantile(0.75)
    iqr = q3 - q1
    df = df[(df[TARGET] >= q1 - 1.5 * iqr) & (df[TARGET] <= q3 + 1.5 * iqr)]

    # Encode variáveis categóricas
    encoders: dict[str, LabelEncoder] = {}
    for col in CATEGORICAL_COLUMNS:
        encoders[col] = LabelEncoder()
        df[col] = encoders[col].fit_transform(df[col].astype(str))

    X = df[FEATURE_COLUMNS].values
    y = df[TARGET].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return X_train, X_test, y_train, y_test, encoders


def evaluate_model(
    name: str, y_true: np.ndarray, y_pred: np.ndarray
) -> dict[str, float]:
    metrics = {
        "MAE": mean_absolute_error(y_true, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred),
    }

    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    print(f"  MAE:  R$ {metrics['MAE']:,.2f}")
    print(f"  RMSE: R$ {metrics['RMSE']:,.2f}")
    print(f"  R²:   {metrics['R2']:.4f}")

    return metrics


def get_models() -> dict:
    from lightgbm import LGBMRegressor
    from xgboost import XGBRegressor

    return {
        "RandomForest": RandomForestRegressor(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1,
        ),
        "XGBoost": XGBRegressor(
            n_estimators=300,
            max_depth=10,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1,
        ),
        "LightGBM": LGBMRegressor(
            n_estimators=300,
            max_depth=15,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1,
            verbose=-1,
        ),
    }


def train_and_evaluate() -> str:
    print("Carregando dados processados...")
    df = load_processed_data()

    print("Preparando dados para treinamento...")
    X_train, X_test, y_train, y_test, encoders = prepare_data(df)
    print(f"  Treino: {X_train.shape[0]} amostras")
    print(f"  Teste:  {X_test.shape[0]} amostras")

    models = get_models()
    results: dict[str, dict] = {}
    best_model_name = ""
    best_r2 = -float("inf")

    for name, model in models.items():
        print(f"\nTreinando {name}...")
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        metrics = evaluate_model(name, y_test, y_pred)
        results[name] = metrics

        if metrics["R2"] > best_r2:
            best_r2 = metrics["R2"]
            best_model_name = name

    # Salva o melhor modelo
    best_model = models[best_model_name]
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    artifact = {
        "model": best_model,
        "encoders": encoders,
        "feature_columns": FEATURE_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
    }

    model_path = MODELS_DIR / "model.joblib"
    joblib.dump(artifact, model_path)

    print(f"\n{'='*50}")
    print(f"  MELHOR MODELO: {best_model_name} (R² = {best_r2:.4f})")
    print(f"  Salvo em: {model_path}")
    print(f"{'='*50}")

    # Salva comparação em CSV
    results_df = pd.DataFrame(results).T
    results_df.to_csv(PROCESSED_DIR / "model_comparison.csv")
    print(f"\nComparação salva em {PROCESSED_DIR / 'model_comparison.csv'}")

    return best_model_name


if __name__ == "__main__":
    train_and_evaluate()
