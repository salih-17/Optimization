import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  Download,
  Printer,
  Package,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import type { OptimizationResults } from "@shared/schema";

export default function ResultsPage() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<OptimizationResults | null>(null);

  useEffect(() => {
    const resultsStr = sessionStorage.getItem("results");
    if (!resultsStr) {
      setLocation("/");
      return;
    }
    const parsedResults = JSON.parse(resultsStr);
    // Ensure all numeric fields have default values
    const safeResults: OptimizationResults = {
      status: parsedResults.status || "Error",
      statusMessage: parsedResults.statusMessage,
      totalBoxes: parsedResults.totalBoxes || 0,
      totalVolume_m3: parsedResults.totalVolume_m3 || 0,
      volumeUtilization: parsedResults.volumeUtilization || 0,
      totalWeight_kg: parsedResults.totalWeight_kg || 0,
      weightUtilization: parsedResults.weightUtilization || 0,
      totalCost: parsedResults.totalCost || 0,
      budgetUtilization: parsedResults.budgetUtilization || 0,
      totalProfit: parsedResults.totalProfit || 0,
      totalScore: parsedResults.totalScore || 0,
      selectedItems: parsedResults.selectedItems || [],
    };
    setResults(safeResults);
  }, [setLocation]);

  const exportMutation = useMutation({
    mutationFn: async (results: OptimizationResults) => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }
      
      const blob = await response.blob();
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimization_results.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const downloadCSV = () => {
    if (!results) return;
    exportMutation.mutate(results);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!results) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No results found. Please run optimization first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (results.status) {
      case "Optimal":
        return (
          <Badge className="bg-chart-2 text-white border-chart-2" data-testid="badge-status">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Optimal Solution
          </Badge>
        );
      case "Infeasible":
        return (
          <Badge variant="destructive" data-testid="badge-status">
            <XCircle className="w-3 h-3 mr-1" />
            Infeasible
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" data-testid="badge-status">
            {results.status}
          </Badge>
        );
    }
  };

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6 print:p-4">
        <div className="flex items-center justify-between print:flex-col print:items-start print:gap-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground print:text-2xl">
              Optimization Results
            </h1>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {results.statusMessage && (
                <span className="text-sm text-muted-foreground">{results.statusMessage}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={downloadCSV} data-testid="button-download-csv">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="outline" onClick={handlePrint} data-testid="button-print">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Boxes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono" data-testid="text-total-boxes">
                {results.totalBoxes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Selected for shipment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Volume Utilization</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono" data-testid="text-volume-utilization">
                {results.volumeUtilization.toFixed(1)}%
              </div>
              <div className="space-y-1 mt-2">
                <Progress value={results.volumeUtilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {results.totalVolume_m3.toFixed(2)} m³ used
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Weight Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono" data-testid="text-weight-utilization">
                {results.weightUtilization.toFixed(1)}%
              </div>
              <div className="space-y-1 mt-2">
                <Progress value={results.weightUtilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {results.totalWeight_kg.toFixed(0)} kg used
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono" data-testid="text-budget-utilization">
                {results.budgetUtilization.toFixed(1)}%
              </div>
              <div className="space-y-1 mt-2">
                <Progress value={results.budgetUtilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  ${results.totalCost.toFixed(0)} spent
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono text-chart-2" data-testid="text-total-profit">
                ${results.totalProfit.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expected profit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold font-mono" data-testid="text-total-score">
                {results.totalScore.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Weighted score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden" data-testid="table-results">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 text-right font-semibold">Selected Qty</th>
                      <th className="px-4 py-3 text-right font-semibold">Volume (m³)</th>
                      <th className="px-4 py-3 text-right font-semibold">Weight (kg)</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Cost</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Profit</th>
                      <th className="px-4 py-3 text-right font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.selectedItems.map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50" data-testid={`row-result-${idx}`}>
                        <td className="px-4 py-3 font-mono text-xs" data-testid={`cell-result-sku-${idx}`}>{item.SKU}</td>
                        <td className="px-4 py-3" data-testid={`cell-result-description-${idx}`}>{item.Description}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs" data-testid={`cell-result-qty-${idx}`}>{item.SelectedQty}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs" data-testid={`cell-result-volume-${idx}`}>
                          {item.VolumeUsed_m3.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" data-testid={`cell-result-weight-${idx}`}>
                          {item.WeightUsed_kg.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" data-testid={`cell-result-cost-${idx}`}>
                          ${item.TotalCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-chart-2" data-testid={`cell-result-profit-${idx}`}>
                          ${item.TotalProfit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" data-testid={`cell-result-score-${idx}`}>
                          {item.Score.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2" data-testid="text-selected-count">
              {results.selectedItems.length} products selected for shipment
            </p>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end print:hidden">
          <Button onClick={() => setLocation("/")} data-testid="button-new-optimization">
            <FileText className="w-4 h-4 mr-2" />
            Start New Optimization
          </Button>
        </div>
      </div>
    </div>
  );
}
