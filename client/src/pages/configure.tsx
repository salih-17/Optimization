import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Play, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product, OptimizationConfig } from "@shared/schema";
import { defaultConfig } from "@shared/schema";

export default function ConfigurePage() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<OptimizationConfig>(defaultConfig);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    field: keyof Product;
  } | null>(null);

  useEffect(() => {
    const storedProducts = sessionStorage.getItem("products");
    if (storedProducts) {
      const parsed = JSON.parse(storedProducts);
      // Add default LeadTimeDays if not present (only on initial load)
      const withDefaults = parsed.map((p: Product) => ({
        ...p,
        LeadTimeDays: p.LeadTimeDays || defaultConfig.GLOBAL_LEAD_TIME_DAYS,
      }));
      setProducts(withDefaults);
    } else {
      setLocation("/");
    }
    // Only run once on mount to avoid wiping user edits
  }, [setLocation]);

  const handleConfigChange = (
    field: keyof OptimizationConfig,
    value: number,
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | number,
  ) => {
    const newProducts = [...products];
    (newProducts[index] as any)[field] =
      typeof value === "string" ? parseFloat(value) || 0 : value;
    setProducts(newProducts);
  };

  const saveAndProceed = () => {
    // Validate weights sum to 1.0
    const weightSum = config.w_profit + config.w_density + config.w_velocity;
    if (Math.abs(weightSum - 1.0) > 0.01) {
      alert("Score weights must sum to 1.0");
      return;
    }

    sessionStorage.setItem("products", JSON.stringify(products));
    sessionStorage.setItem("config", JSON.stringify(config));
    setLocation("/optimize");
  };

  const renderEditableCell = (
    product: Product,
    index: number,
    field: keyof Product,
    isNumeric = true,
  ) => {
    const value = product[field];
    const isEditing =
      editingCell?.row === index && editingCell?.field === field;

    return (
      <td
        className="px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setEditingCell({ row: index, field })}
      >
        {isEditing ? (
          <Input
            type={isNumeric ? "number" : "text"}
            value={value as string | number}
            onChange={(e) =>
              handleProductChange(
                index,
                field,
                isNumeric ? parseFloat(e.target.value) : e.target.value,
              )
            }
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="h-7 text-xs font-mono text-right"
            step={isNumeric ? "0.01" : undefined}
          />
        ) : (
          <span className="font-mono text-xs text-right block">
            {typeof value === "number" ? value.toFixed(2) : value}
          </span>
        )}
      </td>
    );
  };

  if (products.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No products found. Please upload a CSV file first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Configuration
          </h1>
          <p className="text-muted-foreground">
            Adjust global constraints and edit product data before optimization
          </p>
        </div>

        {/* Global Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="space-y-0 pb-3">
              <CardTitle className="text-base">
                Container Specifications
              </CardTitle>
              <CardDescription>
                Physical limits of the shipping container
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-sm font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Volume (m³)</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Maximum container volume in cubic meters
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="volume"
                  type="number"
                  value={config.CONTAINER_VOLUME_M3}
                  onChange={(e) =>
                    handleConfigChange(
                      "CONTAINER_VOLUME_M3",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.1"
                  min="0"
                  className="font-mono"
                  data-testid="input-container-volume"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Max Weight (kg)</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Maximum container weight in kilograms
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={config.CONTAINER_MAX_WEIGHT_KG}
                  onChange={(e) =>
                    handleConfigChange(
                      "CONTAINER_MAX_WEIGHT_KG",
                      parseFloat(e.target.value),
                    )
                  }
                  step="100"
                  min="0"
                  className="font-mono"
                  data-testid="input-container-weight"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-3">
              <CardTitle className="text-base">Budget & Lead Time</CardTitle>
              <CardDescription>
                Financial and timing constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Available Budget</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Total budget available for this shipment
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={config.AVAILABLE_BUDGET}
                  onChange={(e) =>
                    handleConfigChange(
                      "AVAILABLE_BUDGET",
                      parseFloat(e.target.value),
                    )
                  }
                  step="100"
                  min="0"
                  className="font-mono"
                  data-testid="input-budget"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadtime" className="text-sm font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Lead Time (days)</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Default lead time in days for all products
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="leadtime"
                  type="number"
                  value={config.GLOBAL_LEAD_TIME_DAYS}
                  onChange={(e) =>
                    handleConfigChange(
                      "GLOBAL_LEAD_TIME_DAYS",
                      parseInt(e.target.value),
                    )
                  }
                  step="1"
                  min="1"
                  className="font-mono"
                  data-testid="input-lead-time"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="space-y-0 pb-3">
              <CardTitle className="text-base">Score Weights</CardTitle>
              <CardDescription>
                Adjust optimization priorities (must sum to 1.0)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="w_profit" className="text-sm font-medium">
                    Box Profit Weight
                  </Label>
                  <Input
                    id="w_profit"
                    type="number"
                    value={config.w_profit}
                    onChange={(e) =>
                      handleConfigChange("w_profit", parseFloat(e.target.value))
                    }
                    step="0.1"
                    min="0"
                    max="1"
                    className="font-mono"
                    data-testid="input-weight-profit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w_density" className="text-sm font-medium">
                    Profit per Cubic Meter Weight
                  </Label>
                  <Input
                    id="w_density"
                    type="number"
                    value={config.w_density}
                    onChange={(e) =>
                      handleConfigChange(
                        "w_density",
                        parseFloat(e.target.value),
                      )
                    }
                    step="0.1"
                    min="0"
                    max="1"
                    className="font-mono"
                    data-testid="input-weight-density"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w_velocity" className="text-sm font-medium">
                    Sales Velocity Weight
                  </Label>
                  <Input
                    id="w_velocity"
                    type="number"
                    value={config.w_velocity}
                    onChange={(e) =>
                      handleConfigChange(
                        "w_velocity",
                        parseFloat(e.target.value),
                      )
                    }
                    step="0.1"
                    min="0"
                    max="1"
                    className="font-mono"
                    data-testid="input-weight-velocity"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current sum:{" "}
                {(
                  config.w_profit +
                  config.w_density +
                  config.w_velocity
                ).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Data</CardTitle>
            <CardDescription>
              Click any cell to edit values (changes are saved automatically)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border rounded-md overflow-hidden"
              data-testid="table-products"
            >
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold sticky left-0 bg-muted">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Description
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Sales/Day
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Coverage
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Cost/Box
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Profit/Box
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Min Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr
                        key={idx}
                        className="border-t hover:bg-muted/50"
                        data-testid={`row-product-${idx}`}
                      >
                        <td
                          className="px-3 py-2 font-mono text-xs sticky left-0 bg-card border-r"
                          data-testid={`cell-product-sku-${idx}`}
                        >
                          {product.SKU}
                        </td>
                        <td
                          className="px-3 py-2"
                          data-testid={`cell-product-description-${idx}`}
                        >
                          {product.Description}
                        </td>
                        {renderEditableCell(product, idx, "AvailableStock")}
                        {renderEditableCell(product, idx, "SalesPerDay")}
                        {renderEditableCell(product, idx, "CoverageDays")}
                        {renderEditableCell(product, idx, "CostPerBox")}
                        {renderEditableCell(product, idx, "ProfitPerBox")}
                        {renderEditableCell(product, idx, "MinShipQty")}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p
              className="text-xs text-muted-foreground mt-2"
              data-testid="text-product-count"
            >
              {products.length} products loaded
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 sticky bottom-0 bg-background pt-4 pb-2">
          <Button variant="outline" data-testid="button-save-config">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button
            onClick={saveAndProceed}
            data-testid="button-start-optimization"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Optimization
          </Button>
        </div>
      </div>
    </div>
  );
}
