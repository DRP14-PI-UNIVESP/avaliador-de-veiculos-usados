import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
});

export interface ComfortFeatures {
  air_conditioning: boolean;
  electric_windows: boolean;
  electric_locks: boolean;
  leather_seats: boolean;
  electric_mirrors: boolean;
  multimedia_center: boolean;
  rear_camera: boolean;
  parking_sensor: boolean;
}

export interface SafetyFeatures {
  airbag: boolean;
  abs_brakes: boolean;
  alarm: boolean;
  armored: boolean;
}

export interface ConditionFeatures {
  accident_history: boolean;
  single_owner: boolean;
  full_service_history: boolean;
  original_paint: boolean;
  condition: string;
}

export interface VehicleInput {
  brand: string;
  model: string;
  year_model: number;
  mileage_km: number;
  fuel: string;
  gear: string;
  engine_size: number;
  comfort: ComfortFeatures;
  safety: SafetyFeatures;
  condition: ConditionFeatures;
}

export interface PriceAdjustment {
  category: string;
  item: string;
  percentage: number;
  value: number;
}

export interface PredictionOutput {
  base_price: number;
  estimated_price: number;
  currency: string;
  model_used: string;
  adjustments: PriceAdjustment[];
  total_adjustment_percent: number;
}

export const vehicleService = {
  getBrands: () => api.get<string[]>("/vehicles/brands").then((r) => r.data),

  getModelsByBrand: (brand: string) =>
    api.get<string[]>(`/vehicles/brands/${brand}/models`).then((r) => r.data),

  getFuels: () => api.get<string[]>("/vehicles/fuels").then((r) => r.data),

  getGears: () => api.get<string[]>("/vehicles/gears").then((r) => r.data),

  getYears: () =>
    api.get<{ min: number; max: number }>("/vehicles/years").then((r) => r.data),

  predict: (data: VehicleInput) =>
    api.post<PredictionOutput>("/predict", data).then((r) => r.data),
};
