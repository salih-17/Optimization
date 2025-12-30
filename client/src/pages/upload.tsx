import { useState, useCallback } from "react";
import { Upload, FileText, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResponse, Product } from "@shared/schema";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiRequest("POST", "/api/upload", formData);
      const data: UploadResponse = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.products) {
        setUploadedProducts(data.products);
        setError(null);
        // Store products in sessionStorage for next step
        sessionStorage.setItem("products", JSON.stringify(data.products));
      } else if (data.errors && data.errors.length > 0) {
        setError(data.errors.join(", "));
        setUploadedProducts(null);
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to upload file");
      setUploadedProducts(null);
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        uploadMutation.mutate(file);
      } else {
        setError("Please upload a CSV file");
      }
    }
  }, [uploadMutation]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        uploadMutation.mutate(file);
      } else {
        setError("Please upload a CSV file");
      }
    }
  }, [uploadMutation]);

  const downloadSampleCSV = () => {
    const sampleData = `SKU,Description,BoxLength_m,BoxWidth_m,BoxHeight_m,WeightPerBox_kg,AvailableStock,SalesPerDay,CoverageDays,ProfitPerBox,CostPerBox,MinShipQty
SKU001,Green Tea Box,0.50,0.40,0.35,10,500,2.0,60,40,30,50
SKU002,Black Tea Box,0.60,0.40,0.45,12,400,1.5,60,45,35,40
SKU003,White Tea Pack,0.30,0.25,0.20,5,800,1.0,60,15,8,60
SKU004,Oolong Tea,0.45,0.40,0.30,9,300,0.8,60,30,20,30
SKU005,Matcha Powder,0.25,0.25,0.20,4,600,1.2,60,25,12,50`;
    
    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const proceedToConfiguration = () => {
    setLocation("/configure");
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Upload Product Data</h1>
          <p className="text-muted-foreground">
            Upload a CSV file containing your product information to begin optimization
          </p>
        </div>

        <Card className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            data-testid="upload-dropzone"
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              data-testid="input-file-upload"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse your files
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Supported format: CSV files with product data
              </div>
            </div>
          </div>

          {uploadMutation.isPending && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Processing CSV file...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription data-testid="text-upload-error">{error}</AlertDescription>
            </Alert>
          )}

          {uploadedProducts && (
            <Alert className="mt-4 border-chart-2 bg-chart-2/10">
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
              <AlertDescription className="text-chart-2">
                Successfully uploaded {uploadedProducts.length} products
              </AlertDescription>
            </Alert>
          )}

          {uploadedProducts && uploadedProducts.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Preview (First 5 rows)</h3>
              <div className="border rounded-md overflow-hidden" data-testid="table-preview">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">SKU</th>
                        <th className="px-4 py-2 text-left font-semibold">Description</th>
                        <th className="px-4 py-2 text-right font-semibold">Volume (m³)</th>
                        <th className="px-4 py-2 text-right font-semibold">Weight (kg)</th>
                        <th className="px-4 py-2 text-right font-semibold">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedProducts.slice(0, 5).map((product, idx) => {
                        const volume = (product.BoxLength_m * product.BoxWidth_m * product.BoxHeight_m).toFixed(4);
                        return (
                          <tr key={idx} className="border-t hover-elevate" data-testid={`row-preview-${idx}`}>
                            <td className="px-4 py-2 font-mono text-xs" data-testid={`cell-sku-${idx}`}>{product.SKU}</td>
                            <td className="px-4 py-2" data-testid={`cell-description-${idx}`}>{product.Description}</td>
                            <td className="px-4 py-2 text-right font-mono text-xs" data-testid={`cell-volume-${idx}`}>{volume}</td>
                            <td className="px-4 py-2 text-right font-mono text-xs" data-testid={`cell-weight-${idx}`}>{product.WeightPerBox_kg}</td>
                            <td className="px-4 py-2 text-right font-mono text-xs" data-testid={`cell-stock-${idx}`}>{product.AvailableStock}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={downloadSampleCSV}
            data-testid="button-download-sample"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Sample CSV
          </Button>
          
          <Button
            onClick={proceedToConfiguration}
            disabled={!uploadedProducts || uploadedProducts.length === 0}
            data-testid="button-proceed-configure"
          >
            Proceed to Configuration
            <FileText className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
