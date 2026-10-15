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

const VehicleForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [gears, setGears] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [driveTypes, setDriveTypes] = useState<string[]>([]);
  const [sellerTypes, setSellerTypes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 1996, max: 2026 });

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year_model: 2020,
    year_manufacture: 2019,
    mileage_km: 0,
    fuel: "",
    gear: "",
    body_type: "",
    drive_type: "",
    seller_type: "PF",
    city: "",
    neighborhood: "",
    horsepower: 0,
    engine_cc: 0,
  });

  const [comfort, setComfort] = useState<ComfortFeatures>({ ...defaultComfort });
  const [safety, setSafety] = useState<SafetyFeatures>({ ...defaultSafety });
  const [condition, setCondition] = useState<ConditionFeatures>({ ...defaultCondition });

  useEffect(() => {
    Promise.all([
      vehicleService.getBrands(),
      vehicleService.getFuels(),
      vehicleService.getGears(),
      vehicleService.getBodyTypes(),
      vehicleService.getDriveTypes(),
      vehicleService.getSellerTypes(),
      vehicleService.getCities(),
      vehicleService.getYears(),
    ]).then(([brandsData, fuelsData, gearsData, bodyData, driveData, sellerData, citiesData, yearsData]) => {
      setBrands(brandsData);
      setFuels(fuelsData);
      setGears(gearsData);
      setBodyTypes(bodyData);
      setDriveTypes(driveData);
      setSellerTypes(sellerData);
      setCities(citiesData);
      setYearRange(yearsData);
    });
  }, []);

  useEffect(() => {
    if (form.brand) {
      vehicleService.getModelsByBrand(form.brand).then(setModels);
      setForm((prev) => ({ ...prev, model: "" }));
    }
  }, [form.brand]);

  useEffect(() => {
    if (form.city) {
      vehicleService.getNeighborhoodsByCity(form.city).then(setNeighborhoods);
      setForm((prev) => ({ ...prev, neighborhood: "" }));
    }
  }, [form.city]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ["year_model", "year_manufacture", "mileage_km", "horsepower", "engine_cc"];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, comfort, safety, condition });
  };

  const isValid =
    form.brand && form.model && form.fuel && form.gear && form.body_type;

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
                  {b}
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
            <label>Ano de Fabricação</label>
            <input
              type="number"
              name="year_manufacture"
              value={form.year_manufacture}
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
                  {f}
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
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Carroceria</label>
            <select name="body_type" value={form.body_type} onChange={handleChange}>
              <option value="">Selecione...</option>
              {bodyTypes.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tração</label>
            <select name="drive_type" value={form.drive_type} onChange={handleChange}>
              <option value="">Não informado</option>
              {driveTypes.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Vendedor</label>
            <select name="seller_type" value={form.seller_type} onChange={handleChange}>
              {sellerTypes.map((st) => (
                <option key={st} value={st}>
                  {st === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cidade</label>
            <select name="city" value={form.city} onChange={handleChange}>
              <option value="">Não informado</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bairro</label>
            <select
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              disabled={!form.city}
            >
              <option value="">Não informado</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Potência (cv)</label>
            <input
              type="number"
              name="horsepower"
              value={form.horsepower}
              onChange={handleChange}
              min={0}
              step={1}
              placeholder="Ex: 140"
            />
          </div>

          <div className="form-group">
            <label>Cilindrada (litros)</label>
            <input
              type="number"
              name="engine_cc"
              value={form.engine_cc}
              onChange={handleChange}
              min={0}
              max={7}
              step={0.1}
              placeholder="Ex: 2.0"
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
