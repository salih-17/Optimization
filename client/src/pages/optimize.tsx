import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OptimizationRequest, OptimizationResults } from "@shared/schema";

export default function OptimizePage() {
  const [, setLocation] = useLocation();

  const optimizeMutation = useMutation({
    mutationFn: async (request: OptimizationRequest) => {
      const response = await apiRequest("POST", "/api/optimize", request);
      const data: OptimizationResults = await response.json();
      return data;
    },
    onSuccess: (data) => {
      sessionStorage.setItem("results", JSON.stringify(data));
      setLocation("/results");
    },
  });

  useEffect(() => {
    const productsStr = sessionStorage.getItem("products");
    const configStr = sessionStorage.getItem("config");

    if (!productsStr || !configStr) {
      setLocation("/");
      return;
    }

    const products = JSON.parse(productsStr);
    const config = JSON.parse(configStr);

    // Automatically start optimization
    optimizeMutation.mutate({ products, config });
  }, [setLocation]);

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-12">
          <div className="flex flex-col items-center space-y-6 text-center">
            {optimizeMutation.isPending && (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Running Optimization
                  </h2>
                  <p className="text-muted-foreground">
                    Solving linear programming model...
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    This may take a few moments depending on the number of products
                  </p>
                </div>
              </>
            )}

            {optimizeMutation.isError && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription data-testid="text-optimization-error">
                    {optimizeMutation.error instanceof Error
                      ? optimizeMutation.error.message
                      : "Optimization failed"}
                  </AlertDescription>
                </Alert>
                <button
                  onClick={() => setLocation("/configure")}
                  className="text-sm text-primary hover:underline"
                  data-testid="link-return-configure"
                >
                  Return to configuration
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
