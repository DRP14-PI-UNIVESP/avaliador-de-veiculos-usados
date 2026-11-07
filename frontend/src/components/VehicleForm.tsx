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
  dealer_service_history: false,
  original_paint: false,
  ipva_paid: false,
  factory_warranty: false,
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
  full_service_history: "Revisões pela agenda do carro",
  dealer_service_history: "Revisões pela concessionária",
  original_paint: "Pintura original",
  ipva_paid: "IPVA pago",
  factory_warranty: "Garantia de fábrica",
};

const conditionOptions: Record<string, string> = {
  excellent: "Excelente",
  good: "Bom",
  fair: "Regular",
  poor: "Ruim",
};

const fieldTooltips: Record<string, string> = {
  brand: "Fabricante do veículo. Os demais campos serão filtrados com base na marca selecionada.",
  model: "Modelo específico do veículo. Selecione a marca primeiro.",
  year_model: "Ano de referência do modelo (pode ser diferente do ano de fabricação).",
  year_manufacture: "Ano em que o veículo foi fabricado. Opcional — se não informado, será usado o ano do modelo.",
  mileage_km: "Total de quilômetros rodados pelo veículo.",
  fuel: "Tipo de combustível utilizado pelo veículo.",
  gear: "Tipo de transmissão: manual, automática ou CVT.",
  body_type: "Formato da carroceria do veículo.",
  drive_type: "Sistema de tração do veículo. Opcional.",
  seller_type: "Pessoa Física (particular) ou Pessoa Jurídica (loja/revenda).",
  city: "Cidade onde o veículo está sendo vendido. Opcional.",
  neighborhood: "Bairro onde o veículo está sendo vendido. Selecione a cidade primeiro.",
  horsepower: "Potência do motor em cavalos. Opcional — se não informado, será usado o valor médio da base.",
  engine_cc: "Cilindrada do motor em litros (ex: 1.0, 2.0). Opcional — se não informado, será usado o valor médio da base.",
};

const comfortTooltips: Record<string, string> = {
  air_conditioning: "Veículo possui ar-condicionado.",
  electric_windows: "Vidros com acionamento elétrico.",
  electric_locks: "Travas das portas com acionamento elétrico.",
  leather_seats: "Bancos revestidos em couro.",
  electric_mirrors: "Retrovisores com ajuste elétrico.",
  multimedia_center: "Central multimídia com tela (rádio, GPS, etc.).",
  rear_camera: "Câmera para auxiliar manobras de ré.",
  parking_sensor: "Sensores que alertam sobre obstáculos ao estacionar.",
};

const safetyTooltips: Record<string, string> = {
  airbag: "Bolsas infláveis de proteção em caso de colisão.",
  abs_brakes: "Sistema de freios antitravamento.",
  alarm: "Sistema de alarme antifurto.",
  armored: "Veículo com blindagem balística. Impacto significativo no preço.",
};

const conditionTooltips: Record<string, string> = {
  accident_history: "Marque se o veículo já sofreu alguma colisão. Reduz o valor estimado.",
  single_owner: "Veículo teve apenas um proprietário desde zero.",
  full_service_history: "Todas as revisões foram feitas conforme a agenda do fabricante.",
  dealer_service_history: "Todas as revisões foram realizadas em concessionária autorizada.",
  original_paint: "A pintura do veículo é a original de fábrica, sem retoques.",
  ipva_paid: "IPVA do ano vigente está quitado.",
  factory_warranty: "O veículo ainda está coberto pela garantia de fábrica.",
  condition_select: "Avaliação geral do estado de conservação do veículo.",
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
    year_manufacture: "" as number | "",
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

  // Carrega marcas e faixa de anos (fixos, sem filtro)
  useEffect(() => {
    Promise.all([
      vehicleService.getBrands(),
      vehicleService.getYears(),
    ]).then(([brandsData, yearsData]) => {
      setBrands(brandsData);
      setYearRange(yearsData);
    });
  }, []);

  // Quando marca ou modelo muda, busca opções filtradas
  useEffect(() => {
    vehicleService.getFilteredOptions(form.brand, form.model).then((opts) => {
      setModels(opts.models);
      setFuels(opts.fuels);
      setGears(opts.gears);
      setBodyTypes(opts.body_types);
      setDriveTypes(opts.drive_types);
      setSellerTypes(opts.seller_types);
      setCities(opts.cities);
      setYearRange({ min: opts.year_min, max: opts.year_max });

      // Limpa seleções que não existem mais nas opções filtradas
      setForm((prev) => {
        const clampedYearModel = Math.max(opts.year_min, Math.min(opts.year_max, prev.year_model));
        const clampedYearMfg = prev.year_manufacture === ""
          ? ""
          : Math.max(opts.year_min, Math.min(opts.year_max, prev.year_manufacture));
        return {
          ...prev,
          model: form.brand ? (opts.models.includes(prev.model) ? prev.model : "") : prev.model,
          fuel: opts.fuels.includes(prev.fuel) ? prev.fuel : "",
          gear: opts.gears.includes(prev.gear) ? prev.gear : "",
          body_type: opts.body_types.includes(prev.body_type) ? prev.body_type : "",
          drive_type: opts.drive_types.includes(prev.drive_type) ? prev.drive_type : "",
          seller_type: opts.seller_types.includes(prev.seller_type) ? prev.seller_type : (opts.seller_types[0] || "PF"),
          city: opts.cities.includes(prev.city) ? prev.city : "",
          neighborhood: "",
          year_model: clampedYearModel,
          year_manufacture: clampedYearMfg,
        };
      });
    });
  }, [form.brand, form.model]);

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
    if (name === "year_manufacture") {
      setForm((prev) => ({
        ...prev,
        year_manufacture: value === "" ? "" : Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      year_manufacture: form.year_manufacture === "" ? null : form.year_manufacture,
      comfort,
      safety,
      condition,
    };
    onSubmit(payload as any);
  };

  const handleClear = () => {
    setForm({
      brand: "",
      model: "",
      year_model: 2020,
      year_manufacture: "" as number | "",
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
    setComfort({ ...defaultComfort });
    setSafety({ ...defaultSafety });
    setCondition({ ...defaultCondition });
  };

  const isValid =
    form.brand && form.model && form.fuel && form.gear && form.body_type;

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Dados do Veículo</h2>
          <button
            type="button"
            onClick={handleClear}
            className="btn-clear"
          >
            Limpar
          </button>
        </div>
        <form onSubmit={handleSubmit} id="vehicle-form" className="form-grid">
          <div className="form-group">
            <label title={fieldTooltips.brand} className="label-tooltip">Marca</label>
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
            <label title={fieldTooltips.model} className="label-tooltip">Modelo</label>
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
            <label title={fieldTooltips.year_model} className="label-tooltip">Ano do Modelo</label>
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
            <label title={fieldTooltips.year_manufacture} className="label-tooltip">Ano de Fabricação</label>
            <input
              type="number"
              name="year_manufacture"
              value={form.year_manufacture}
              onChange={handleChange}
              min={yearRange.min}
              max={2026}
              placeholder="Igual ao ano do modelo"
            />
          </div>

          <div className="form-group">
            <label title={fieldTooltips.mileage_km} className="label-tooltip">Quilometragem (km)</label>
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
            <label title={fieldTooltips.fuel} className="label-tooltip">Combustível</label>
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
            <label title={fieldTooltips.gear} className="label-tooltip">Câmbio</label>
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
            <label title={fieldTooltips.body_type} className="label-tooltip">Carroceria</label>
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
            <label title={fieldTooltips.drive_type} className="label-tooltip">Tração</label>
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
            <label title={fieldTooltips.seller_type} className="label-tooltip">Tipo de Vendedor</label>
            <select name="seller_type" value={form.seller_type} onChange={handleChange}>
              {sellerTypes.map((st) => (
                <option key={st} value={st}>
                  {st === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label title={fieldTooltips.city} className="label-tooltip">Cidade</label>
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
            <label title={fieldTooltips.neighborhood} className="label-tooltip">Bairro</label>
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
            <label title={fieldTooltips.horsepower} className="label-tooltip">Potência (cv)</label>
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
            <label title={fieldTooltips.engine_cc} className="label-tooltip">Cilindrada (litros)</label>
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
            <label key={key} className="checkbox-item" title={comfortTooltips[key]}>
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
            <label key={key} className="checkbox-item" title={safetyTooltips[key]}>
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
            <label title={conditionTooltips.condition_select} className="label-tooltip">Estado Geral</label>
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
            <label key={key} className="checkbox-item" title={conditionTooltips[key]}>
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
