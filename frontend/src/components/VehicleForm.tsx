import React, { useEffect, useState } from "react";
import {
  vehicleService,
  VehicleInput,
  ComfortFeatures,
  SafetyFeatures,
  ConditionFeatures,
} from "../services/api";

interface Props {
  onSubmit: (data: VehicleInput) => void;
  loading: boolean;
}

const defaultComfort: ComfortFeatures = {
  air_conditioning: false,
  electric_windows: false,
  electric_locks: false,
  leather_seats: false,
  electric_mirrors: false,
  multimedia_center: false,
  rear_camera: false,
  parking_sensor: false,
};

const defaultSafety: SafetyFeatures = {
  airbag: false,
  abs_brakes: false,
  alarm: false,
  armored: false,
};

const defaultCondition: ConditionFeatures = {
  accident_history: false,
  single_owner: false,
  full_service_history: false,
  original_paint: false,
  condition: "good",
};

const comfortLabels: Record<string, string> = {
  air_conditioning: "Ar-condicionado",
  electric_windows: "Vidros elétricos",
  electric_locks: "Travas elétricas",
  leather_seats: "Bancos de couro",
  electric_mirrors: "Retrovisores elétricos",
  multimedia_center: "Central multimídia",
  rear_camera: "Câmera de ré",
  parking_sensor: "Sensor de estacionamento",
};

const safetyLabels: Record<string, string> = {
  airbag: "Airbag",
  abs_brakes: "Freios ABS",
  alarm: "Alarme",
  armored: "Blindagem",
};

const conditionCheckLabels: Record<string, string> = {
  accident_history: "Já foi batido",
  single_owner: "Único dono",
  full_service_history: "Revisões em dia",
  original_paint: "Pintura original",
};

const conditionOptions: Record<string, string> = {
  excellent: "Excelente",
  good: "Bom",
  fair: "Regular",
  poor: "Ruim",
};

const fuelLabels: Record<string, string> = {
  gasoline: "Gasolina",
  diesel: "Diesel",
  alcohol: "Etanol",
};

const gearLabels: Record<string, string> = {
  manual: "Manual",
  automatic: "Automático",
};

const VehicleForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [gears, setGears] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 1985, max: 2023 });

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year_model: 2020,
    mileage_km: 0,
    fuel: "",
    gear: "",
    engine_size: 1.0,
  });

  const [comfort, setComfort] = useState<ComfortFeatures>({ ...defaultComfort });
  const [safety, setSafety] = useState<SafetyFeatures>({ ...defaultSafety });
  const [condition, setCondition] = useState<ConditionFeatures>({ ...defaultCondition });

  useEffect(() => {
    Promise.all([
      vehicleService.getBrands(),
      vehicleService.getFuels(),
      vehicleService.getGears(),
      vehicleService.getYears(),
    ]).then(([brandsData, fuelsData, gearsData, yearsData]) => {
      setBrands(brandsData);
      setFuels(fuelsData);
      setGears(gearsData);
      setYearRange(yearsData);
    });
  }, []);

  useEffect(() => {
    if (form.brand) {
      vehicleService.getModelsByBrand(form.brand).then(setModels);
      setForm((prev) => ({ ...prev, model: "" }));
    }
  }, [form.brand]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "year_model" || name === "mileage_km" || name === "engine_size"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, comfort, safety, condition });
  };

  const isValid =
    form.brand && form.model && form.fuel && form.gear && form.engine_size > 0;

  return (
    <>
      <div className="card">
        <h2>Dados do Veículo</h2>
        <form onSubmit={handleSubmit} id="vehicle-form" className="form-grid">
          <div className="form-group">
            <label>Marca</label>
            <select name="brand" value={form.brand} onChange={handleChange}>
              <option value="">Selecione...</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Modelo</label>
            <select
              name="model"
              value={form.model}
              onChange={handleChange}
              disabled={!form.brand}
            >
              <option value="">Selecione...</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ano do Modelo</label>
            <input
              type="number"
              name="year_model"
              value={form.year_model}
              onChange={handleChange}
              min={yearRange.min}
              max={2026}
            />
          </div>

          <div className="form-group">
            <label>Quilometragem (km)</label>
            <input
              type="number"
              name="mileage_km"
              value={form.mileage_km}
              onChange={handleChange}
              min={0}
              step={1000}
            />
          </div>

          <div className="form-group">
            <label>Combustível</label>
            <select name="fuel" value={form.fuel} onChange={handleChange}>
              <option value="">Selecione...</option>
              {fuels.map((f) => (
                <option key={f} value={f}>
                  {fuelLabels[f] || f}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Câmbio</label>
            <select name="gear" value={form.gear} onChange={handleChange}>
              <option value="">Selecione...</option>
              {gears.map((g) => (
                <option key={g} value={g}>
                  {gearLabels[g] || g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Motor (litros)</label>
            <input
              type="number"
              name="engine_size"
              value={form.engine_size}
              onChange={handleChange}
              min={0.5}
              max={7.0}
              step={0.1}
            />
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Conforto</h2>
        <div className="checkbox-grid">
          {Object.entries(comfortLabels).map(([key, label]) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={comfort[key as keyof ComfortFeatures]}
                onChange={(e) =>
                  setComfort((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Segurança</h2>
        <div className="checkbox-grid">
          {Object.entries(safetyLabels).map(([key, label]) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={safety[key as keyof SafetyFeatures]}
                onChange={(e) =>
                  setSafety((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Condição do Veículo</h2>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Estado Geral</label>
            <select
              value={condition.condition}
              onChange={(e) =>
                setCondition((prev) => ({ ...prev, condition: e.target.value }))
              }
            >
              {Object.entries(conditionOptions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="checkbox-grid" style={{ marginTop: "1rem" }}>
          {Object.entries(conditionCheckLabels).map(([key, label]) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={condition[key as keyof ConditionFeatures] as boolean}
                onChange={(e) =>
                  setCondition((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        form="vehicle-form"
        className="btn-predict"
        disabled={!isValid || loading}
        style={{ width: "100%", marginBottom: "1.5rem" }}
      >
        {loading ? "Calculando..." : "Estimar Preço"}
      </button>
    </>
  );
};

export default VehicleForm;
