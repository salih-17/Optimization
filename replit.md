# Salih Container Optimization

## Overview

Salih Container Optimization is a professional web application that helps users select the optimal set of products to load into shipping containers while respecting volume, weight, and budget constraints. The system uses linear programming (PuLP) to solve optimization problems, allowing users to upload product data via CSV, configure constraints interactively, run optimization algorithms, and generate detailed reports. The application follows a guided workflow: Upload → Configure → Optimize → Results.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, Vite build system, Wouter for routing

**UI Framework**: Shadcn UI components (Material Design-inspired) with Tailwind CSS for styling. The design follows a data-focused approach prioritizing clarity, spatial efficiency, and information density over decoration.

**State Management**: 
- Client-side sessionStorage for temporary workflow data (products, configuration, results)
- TanStack Query (React Query) for API state management and mutations
- No persistent client-side database - all data flows through API endpoints

**Routing Strategy**: Four-page workflow implemented with Wouter:
1. `/` - Upload page for CSV file upload
2. `/configure` - Interactive table for editing products and constraints
3. `/optimize` - Processing page that auto-runs optimization
4. `/results` - Results dashboard with metrics and export options

**Key Design Patterns**:
- Stateless backend design - all optimization data processed on-demand
- Session-based temporary storage between workflow steps
- Form validation using Zod schemas shared between client and server
- Responsive layout with sidebar navigation and theme toggle (light/dark mode)

### Backend Architecture

**Runtime**: Node.js with Express.js server framework

**Python Integration**: Backend spawns Python child processes to run PuLP optimization scripts. The Python script (`server/optimizer.py`) receives JSON data via stdin and returns results via stdout.

**API Design**: RESTful endpoints
- `POST /api/upload` - CSV file upload and parsing (using multer for file handling)
- `POST /api/optimize` - Runs Python optimization script with product data and constraints
- `POST /api/export` - Generates CSV export of results

**Request Flow**:
1. CSV upload → Parse with csv-parse library → Validate against Zod schema → Return products array
2. Optimization request → Serialize to JSON → Spawn Python process → Parse results → Return optimization metrics
3. Export request → Format results as CSV → Stream response

**Validation**: Shared Zod schemas (`shared/schema.ts`) ensure type safety between frontend and backend. Validates product data structure, numeric constraints, and configuration parameters.

### Data Storage Solutions

**No Traditional Database**: The application intentionally avoids persistent storage for the MVP. All data exists temporarily in:
- Client sessionStorage (workflow state)
- Request/response payloads (API communication)
- Python process memory (during optimization)

**Note on Database Configuration**: While Drizzle ORM is configured with PostgreSQL in `drizzle.config.ts`, the current implementation does not utilize a database. This suggests the architecture may support future persistence features, but the current storage layer (`server/storage.ts`) is a placeholder.

**File Storage**: Uploaded CSV files are processed in-memory using multer's memoryStorage, converted to UTF-8 strings, and parsed immediately without disk persistence.

### External Dependencies

**Python Optimization Engine**:
- **PuLP**: Linear programming library for solving container optimization problems
- **Pandas**: Data manipulation for processing product datasets
- **NumPy**: Numerical operations for normalization and calculations
- Process communication via JSON through stdin/stdout

**Frontend Libraries**:
- **Radix UI**: Headless component primitives (dialogs, popovers, dropdowns, etc.)
- **Lucide React**: Icon library for UI elements
- **date-fns**: Date formatting utilities
- **class-variance-authority**: Type-safe CSS variant management

**Backend Libraries**:
- **multer**: Multipart form data handling for file uploads
- **csv-parse**: CSV parsing with column mapping and type casting
- **Zod**: Runtime type validation and schema definition

**Build & Development Tools**:
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling with custom design tokens

**Fonts**: Google Fonts integration (Inter for UI, JetBrains Mono for numerical data, Roboto as fallback)

**Development Environment**: Configured for Replit with cartographer and dev banner plugins for development mode.