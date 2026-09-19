import React, { useState } from "react";
import VehicleForm from "./components/VehicleForm";
import PredictionResult from "./components/PredictionResult";
import {
  vehicleService,
  VehicleInput,
  PredictionOutput,
} from "./services/api";
import "./styles/App.css";

function App() {
  const [result, setResult] = useState<PredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: VehicleInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await vehicleService.predict(data);
      setResult(prediction);
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Erro ao conectar com o servidor. Verifique se o backend está rodando.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Avaliador Inteligente de Veículos Usados</h1>
        <p>Estimativa de preço de mercado com Machine Learning</p>
      </header>

      <main className="main-content">
        <VehicleForm onSubmit={handleSubmit} loading={loading} />

        {error && <div className="error-message">{error}</div>}

        {result && <PredictionResult result={result} />}
      </main>

      <footer className="footer">
        Projeto Integrador IV — UNIVESP — 2026
      </footer>
    </div>
  );
}

export default App;
