import React from "react";
import { PredictionOutput } from "../services/api";

interface Props {
  result: PredictionOutput;
}

const formatPrice = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const PredictionResult: React.FC<Props> = ({ result }) => {
  const groupedAdjustments = result.adjustments.reduce(
    (acc, adj) => {
      if (!acc[adj.category]) acc[adj.category] = [];
      acc[adj.category].push(adj);
      return acc;
    },
    {} as Record<string, typeof result.adjustments>
  );

  return (
    <>
      <div className="card result-card">
        <h2>Resultado da Avaliação</h2>
        <div className="price-display">
          <div className="price">{formatPrice(result.estimated_price)}</div>
          <div className="label">Preço estimado de mercado</div>
        </div>
        <div className="result-details">
          <div className="detail">
            <div className="value">{formatPrice(result.base_price)}</div>
            <div className="label">Preço base (ML)</div>
          </div>
          <div className="detail">
            <div className="value">{result.model_used}</div>
            <div className="label">Modelo de ML</div>
          </div>
          <div className="detail">
            <div
              className="value"
              style={{
                color:
                  result.total_adjustment_percent > 0
                    ? "#2e7d32"
                    : result.total_adjustment_percent < 0
                    ? "#c62828"
                    : "#333",
              }}
            >
              {result.total_adjustment_percent > 0 ? "+" : ""}
              {result.total_adjustment_percent.toFixed(1)}%
            </div>
            <div className="label">Ajuste total</div>
          </div>
        </div>
      </div>

      {result.adjustments.length > 0 && (
        <div className="card">
          <h2>Detalhamento dos Ajustes</h2>
          {Object.entries(groupedAdjustments).map(([category, items]) => (
            <div key={category} className="adjustment-category">
              <h3 className="category-title">{category}</h3>
              {items.map((adj, i) => (
                <div key={i} className="adjustment-row">
                  <span className="adjustment-item">{adj.item}</span>
                  <span
                    className="adjustment-value"
                    style={{ color: adj.percentage >= 0 ? "#2e7d32" : "#c62828" }}
                  >
                    {adj.percentage > 0 ? "+" : ""}
                    {adj.percentage.toFixed(1)}% ({formatPrice(adj.value)})
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PredictionResult;
