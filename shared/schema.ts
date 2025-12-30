import { z } from "zod";

// Product data schema (CSV row structure)
export const productSchema = z.object({
  SKU: z.string().min(1, "SKU is required"),
  Description: z.string().min(1, "Description is required"),
  BoxLength_m: z.number().positive("Box length must be positive"),
  BoxWidth_m: z.number().positive("Box width must be positive"),
  BoxHeight_m: z.number().positive("Box height must be positive"),
  WeightPerBox_kg: z.number().positive("Weight must be positive"),
  AvailableStock: z.number().int().nonnegative("Available stock must be non-negative"),
  SalesPerDay: z.number().nonnegative("Sales per day must be non-negative"),
  CoverageDays: z.number().int().positive("Coverage days must be positive"),
  ProfitPerBox: z.number("Profit per box must be a number"),
  CostPerBox: z.number().nonnegative("Cost per box must be non-negative"),
  MinShipQty: z.number().int().nonnegative("Min ship quantity must be non-negative"),
  LeadTimeDays: z.number().int().positive("Lead time days must be positive").optional(),
});

export type Product = z.infer<typeof productSchema>;

// Global optimization configuration
export const optimizationConfigSchema = z.object({
  CONTAINER_VOLUME_M3: z.number().positive("Container volume must be positive"),
  CONTAINER_MAX_WEIGHT_KG: z.number().positive("Container max weight must be positive"),
  AVAILABLE_BUDGET: z.number().positive("Budget must be positive"),
  GLOBAL_LEAD_TIME_DAYS: z.number().int().positive("Lead time must be positive"),
  w_profit: z.number().min(0).max(1, "Weight must be between 0 and 1"),
  w_density: z.number().min(0).max(1, "Weight must be between 0 and 1"),
  w_velocity: z.number().min(0).max(1, "Weight must be between 0 and 1"),
});

export type OptimizationConfig = z.infer<typeof optimizationConfigSchema>;

// Default configuration values
export const defaultConfig: OptimizationConfig = {
  CONTAINER_VOLUME_M3: 33.0,
  CONTAINER_MAX_WEIGHT_KG: 26000.0,
  AVAILABLE_BUDGET: 20000,
  GLOBAL_LEAD_TIME_DAYS: 30,
  w_profit: 0.3,
  w_density: 0.6,
  w_velocity: 0.1,
};

// Optimization request (sent to backend)
export const optimizationRequestSchema = z.object({
  products: z.array(productSchema),
  config: optimizationConfigSchema,
});

export type OptimizationRequest = z.infer<typeof optimizationRequestSchema>;

// Result for a single selected SKU
export const resultItemSchema = z.object({
  SKU: z.string(),
  Description: z.string(),
  SelectedQty: z.number().int().nonnegative(),
  VolumeUsed_m3: z.number().nonnegative(),
  WeightUsed_kg: z.number().nonnegative(),
  TotalCost: z.number().nonnegative(),
  TotalProfit: z.number(),
  Score: z.number(),
  OrderQty: z.number().int().nonnegative(),
});

export type ResultItem = z.infer<typeof resultItemSchema>;

// Complete optimization results
export const optimizationResultsSchema = z.object({
  status: z.enum(["Optimal", "Infeasible", "Unbounded", "Undefined", "Error"]),
  statusMessage: z.string().optional(),
  totalBoxes: z.number().int().nonnegative(),
  totalVolume_m3: z.number().nonnegative(),
  volumeUtilization: z.number().min(0).max(100),
  totalWeight_kg: z.number().nonnegative(),
  weightUtilization: z.number().min(0).max(100),
  totalCost: z.number().nonnegative(),
  budgetUtilization: z.number().min(0).max(100),
  totalProfit: z.number(),
  totalScore: z.number(),
  selectedItems: z.array(resultItemSchema),
});

export type OptimizationResults = z.infer<typeof optimizationResultsSchema>;

// Upload response from backend
export const uploadResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(productSchema).optional(),
  errors: z.array(z.string()).optional(),
  rowCount: z.number().int().optional(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
