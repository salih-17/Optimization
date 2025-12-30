# Salih Container Optimization

A professional web application for optimizing container load selection using linear programming. Upload product data, configure constraints, run optimization algorithms, and generate detailed reports.

## Overview

Salih Container Optimization helps you select the optimal set of products to load into a shipping container while respecting volume, weight, and budget constraints. The application uses:

- **Frontend**: React with TypeScript, Tailwind CSS, and Shadcn UI components
- **Backend**: Express.js with Python integration
- **Optimizer**: PuLP (Python Linear Programming) for solving optimization problems

## Features

- **CSV Upload**: Drag-and-drop interface for uploading product data
- **Interactive Configuration**: Edit global constraints (volume, weight, budget, lead time) and product-specific parameters
- **Optimization Engine**: Solves linear programming problems considering:
  - Container volume limits
  - Container weight limits
  - Budget constraints
  - Minimum shipment quantities
  - Multi-objective scoring (profit, density, velocity)
- **Results Dashboard**: Visual metrics showing utilization percentages, selected products, and profitability
- **Export Options**: Download results as CSV or print for reporting

## Workflow

1. **Upload CSV**: Upload your product data with required columns (SKU, dimensions, weights, costs, etc.)
2. **Configure**: Adjust global constraints and edit product-specific values in an interactive table
3. **Optimize**: Run the optimization algorithm to find the best product selection
4. **Results**: Review metrics, selected products, and export results

## Installation & Setup

### Prerequisites

- Node.js 20.x
- Python 3.11
- npm

### Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Python dependencies are already configured via uv
# They will be automatically available when running the app
```

### Running the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

## CSV File Format

Your CSV file must include these columns:

| Column | Type | Description |
|--------|------|-------------|
| SKU | string | Unique product identifier |
| Description | string | Product description |
| BoxLength_m | number | Box length in meters |
| BoxWidth_m | number | Box width in meters |
| BoxHeight_m | number | Box height in meters |
| WeightPerBox_kg | number | Weight per box in kilograms |
| AvailableStock | integer | Current available stock |
| SalesPerDay | number | Average daily sales rate |
| CoverageDays | integer | Number of days to cover |
| ProfitPerBox | number | Profit per box |
| CostPerBox | number | Cost per box |
| MinShipQty | integer | Minimum shipment quantity |
| LeadTimeDays | integer | Lead time in days (optional) |

### Sample CSV

Download a sample CSV from the upload page or use this format:

```csv
SKU,Description,BoxLength_m,BoxWidth_m,BoxHeight_m,WeightPerBox_kg,AvailableStock,SalesPerDay,CoverageDays,ProfitPerBox,CostPerBox,MinShipQty
SKU001,Green Tea Box,0.50,0.40,0.35,10,500,2.0,60,40,30,50
SKU002,Black Tea Box,0.60,0.40,0.45,12,400,1.5,60,45,35,40
SKU003,White Tea Pack,0.30,0.25,0.20,5,800,1.0,60,15,8,60
```

## Configuration Parameters

### Global Constraints

- **Container Volume (m³)**: Maximum volume capacity (default: 33.0)
- **Container Max Weight (kg)**: Maximum weight capacity (default: 26,000)
- **Available Budget**: Total budget available (default: 20,000)
- **Lead Time (days)**: Default lead time for all products (default: 30)

### Score Weights

The optimizer uses a weighted scoring system to balance multiple objectives:

- **Profit Weight**: Importance of profit per box (default: 0.3)
- **Density Weight**: Importance of profit per cubic meter (default: 0.6)
- **Velocity Weight**: Importance of sales velocity (default: 0.1)

*Note: Weights must sum to 1.0*

## How the Optimization Works

1. **Calculate Demand**: Based on sales per day, lead time, and coverage days
2. **Determine Order Quantities**: Calculate required quantities minus available stock
3. **Score Products**: Normalize profit, density, and velocity metrics, then apply weights
4. **Solve LP Problem**: Use PuLP to maximize total score while respecting:
   - Volume constraint
   - Weight constraint
   - Budget constraint
   - Minimum shipment quantity constraints

## Technology Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Express.js
- Multer for file uploads
- csv-parse for CSV processing
- Child process for Python integration

### Optimization
- Python 3.11
- pandas for data manipulation
- PuLP for linear programming
- NumPy for numerical operations

## Project Structure

```
├── client/               # Frontend React application
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable UI components
│       └── lib/         # Utilities and helpers
├── server/              # Backend Express application
│   ├── routes.ts       # API endpoints
│   ├── optimizer.py    # Python optimization script
│   └── storage.ts      # Storage interface
└── shared/             # Shared types and schemas
    └── schema.ts       # Zod schemas and TypeScript types
```

## API Endpoints

### POST /api/upload
Upload and validate CSV file

**Request**: multipart/form-data with file
**Response**: Validated product array or validation errors

### POST /api/optimize
Run optimization algorithm

**Request**: 
```json
{
  "products": [...],
  "config": {
    "CONTAINER_VOLUME_M3": 33.0,
    "CONTAINER_MAX_WEIGHT_KG": 26000,
    ...
  }
}
```

**Response**: Optimization results with selected products and metrics

## Development

```bash
# Run development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build
```

## License

MIT

## Support

For issues or questions, please refer to the documentation or contact support.
