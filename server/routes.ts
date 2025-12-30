import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { productSchema, optimizationRequestSchema, type UploadResponse, type OptimizationResults } from "@shared/schema";
import { z } from "zod";

// ESM compatibility: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/upload - Upload and parse CSV file
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          errors: ["No file uploaded"],
        } as UploadResponse);
      }

      const fileContent = req.file.buffer.toString("utf-8");
      
      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: (value, context) => {
          // Convert numeric columns
          if (context.column && typeof context.column === "string") {
            const numericColumns = [
              "BoxLength_m", "BoxWidth_m", "BoxHeight_m", "WeightPerBox_kg",
              "AvailableStock", "SalesPerDay", "CoverageDays",
              "ProfitPerBox", "CostPerBox", "MinShipQty", "LeadTimeDays"
            ];
            if (numericColumns.includes(context.column)) {
              const num = parseFloat(value);
              return isNaN(num) ? 0 : num;
            }
          }
          return value;
        },
      });

      // Validate each product
      const products = [];
      const errors: string[] = [];

      for (let i = 0; i < records.length; i++) {
        try {
          const validated = productSchema.parse(records[i]);
          products.push(validated);
        } catch (e) {
          if (e instanceof z.ZodError) {
            errors.push(`Row ${i + 1}: ${e.errors.map(err => err.message).join(", ")}`);
          }
        }
      }

      if (errors.length > 0 && products.length === 0) {
        return res.status(400).json({
          success: false,
          errors,
        } as UploadResponse);
      }

      return res.json({
        success: true,
        products,
        rowCount: products.length,
        errors: errors.length > 0 ? errors : undefined,
      } as UploadResponse);

    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to process file"],
      } as UploadResponse);
    }
  });

  // GET /api/export - Export results as CSV
  app.post("/api/export", async (req: Request, res: Response) => {
    try {
      const { results } = req.body;
      
      if (!results || !results.selectedItems) {
        return res.status(400).json({ error: "No results provided" });
      }

      // Generate CSV
      const headers = ["SKU", "Description", "Selected Qty", "Volume (m³)", "Weight (kg)", "Total Cost", "Total Profit", "Score", "Order Qty"];
      const rows = results.selectedItems.map((item: any) => [
        item.SKU,
        item.Description,
        item.SelectedQty,
        item.VolumeUsed_m3.toFixed(4),
        item.WeightUsed_kg.toFixed(2),
        item.TotalCost.toFixed(2),
        item.TotalProfit.toFixed(2),
        item.Score.toFixed(4),
        item.OrderQty,
      ]);

      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=optimization_results.csv");
      res.send(csv);

    } catch (error) {
      console.error("Export error:", error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export results" 
      });
    }
  });

  // POST /api/optimize - Run optimization
  app.post("/api/optimize", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedRequest = optimizationRequestSchema.parse(req.body);

      // Prepare input for Python script
      const input = JSON.stringify(validatedRequest);

      // Spawn Python process
      const pythonPath = process.env.PYTHON_PATH || "python3";
      // In production, __dirname is dist/, but optimizer.py is in server/
      // In development, __dirname is server/
      const scriptPath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "server", "optimizer.py")
        : path.join(__dirname, "optimizer.py");
      
      const python = spawn(pythonPath, [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      // Send input to Python process
      python.stdin.write(input);
      python.stdin.end();

      python.on("close", (code) => {
        if (code !== 0) {
          console.error("Python error:", errorOutput);
          return res.status(500).json({
            status: "Error",
            statusMessage: errorOutput || "Optimization failed",
            totalBoxes: 0,
            totalVolume_m3: 0,
            volumeUtilization: 0,
            totalWeight_kg: 0,
            weightUtilization: 0,
            totalCost: 0,
            budgetUtilization: 0,
            totalProfit: 0,
            totalScore: 0,
            selectedItems: [],
          } as OptimizationResults);
        }

        try {
          const results: OptimizationResults = JSON.parse(output);
          return res.json(results);
        } catch (e) {
          console.error("Failed to parse Python output:", output);
          return res.status(500).json({
            status: "Error",
            statusMessage: "Failed to parse optimization results",
            totalBoxes: 0,
            totalVolume_m3: 0,
            volumeUtilization: 0,
            totalWeight_kg: 0,
            weightUtilization: 0,
            totalCost: 0,
            budgetUtilization: 0,
            totalProfit: 0,
            totalScore: 0,
            selectedItems: [],
          } as OptimizationResults);
        }
      });

    } catch (error) {
      console.error("Optimization error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "Error",
          statusMessage: `Validation error: ${error.errors.map(e => e.message).join(", ")}`,
          totalBoxes: 0,
          totalVolume_m3: 0,
          volumeUtilization: 0,
          totalWeight_kg: 0,
          weightUtilization: 0,
          totalCost: 0,
          budgetUtilization: 0,
          totalProfit: 0,
          totalScore: 0,
          selectedItems: [],
        } as OptimizationResults);
      }
      return res.status(500).json({
        status: "Error",
        statusMessage: error instanceof Error ? error.message : "Optimization failed",
        totalBoxes: 0,
        totalVolume_m3: 0,
        volumeUtilization: 0,
        totalWeight_kg: 0,
        weightUtilization: 0,
        totalCost: 0,
        budgetUtilization: 0,
        totalProfit: 0,
        totalScore: 0,
        selectedItems: [],
      } as OptimizationResults);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
