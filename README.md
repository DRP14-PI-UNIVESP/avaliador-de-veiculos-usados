# Avaliador Inteligente de Veículos Usados

Estimativa de preço de mercado para veículos usados com machine learning — Projeto Integrador IV UNIVESP.

## Sobre

Sistema que utiliza técnicas de aprendizagem de máquina (regressão supervisionada) para estimar o valor de mercado de veículos usados a partir de seus atributos: marca, modelo, ano, quilometragem, motorização, câmbio e combustível.

## Arquitetura

```
├── backend/
│   ├── app/                    # API FastAPI
│   │   ├── api/routes/         # Endpoints
│   │   ├── core/               # Configurações
│   │   ├── schemas/            # Validação de dados (Pydantic)
│   │   └── services/           # Lógica de negócio
│   ├── ml/                     # Machine Learning
│   │   ├── data/raw/           # Dados brutos (não versionados)
│   │   ├── data/processed/     # Dados tratados (não versionados)
│   │   ├── models/             # Modelos treinados (.joblib)
│   │   ├── notebooks/          # Jupyter notebooks (EDA)
│   │   └── pipelines/          # Pipelines de dados e treino
│   └── tests/                  # Testes unitários e de integração
├── frontend/                   # Interface React
├── docker-compose.yml
└── README.md
```

## Stack

| Camada       | Tecnologia                         |
|--------------|-------------------------------------|
| Frontend     | React                               |
| Backend/API  | FastAPI (Python)                    |
| ML           | scikit-learn, XGBoost, LightGBM     |
| Métricas     | MAE, RMSE, R²                       |
| Container    | Docker / Docker Compose             |
| Dataset      | Kaggle (FIPE - preços médios Brasil) |

## Como executar

### Pré-requisitos

- Python 3.12+
- Node.js 20+
- Docker e Docker Compose (opcional)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker

```bash
docker compose up --build
```

## Equipe

Projeto Integrador IV — UNIVESP — Polo Capão Redondo / CEU Azul da Cor do Mar / Uniceu Navegantes
