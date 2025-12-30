# Salih Container Optimization - Design Guidelines

## Design Approach: Material Design System (Data-Focused)
**Rationale:** This is a utility-focused business application with information-dense content (data tables, numerical inputs, optimization results). Material Design provides the perfect foundation with its emphasis on data presentation, clear hierarchy, and professional aesthetics suitable for productivity tools.

## Core Design Principles
- **Clarity Over Decoration**: Every visual element serves a functional purpose
- **Spatial Efficiency**: Maximize information density without overwhelming users
- **Guided Workflow**: Clear visual progression through Upload → Configure → Optimize → Results
- **Data Prominence**: Tables and numbers are the heroes, UI recedes to support them

## Color Palette

### Primary Colors (Light Mode)
- **Primary**: 210 100% 45% (Deep Blue) - headers, CTAs, active states
- **Primary Variant**: 210 80% 35% (Darker Blue) - hover states
- **Secondary**: 160 60% 45% (Teal) - success states, validation checks
- **Background**: 0 0% 98% (Off-white)
- **Surface**: 0 0% 100% (Pure white) - cards, tables, modals

### Dark Mode
- **Primary**: 210 90% 65% (Lighter Blue) - maintains readability
- **Background**: 220 15% 12% (Dark Blue-Gray)
- **Surface**: 220 15% 18% (Elevated Dark Surface)
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 70%

### Semantic Colors
- **Success**: 142 70% 45% (Green) - optimization complete, valid inputs
- **Warning**: 38 95% 55% (Amber) - constraint warnings
- **Error**: 0 85% 60% (Red) - validation errors, solver failures
- **Info**: 199 85% 50% (Cyan) - tooltips, help text

## Typography

**Font Stack**: 'Inter' (primary), 'Roboto' (fallback), system-ui
- **Headings (H1)**: 32px/40px, font-weight 600 - page titles
- **Headings (H2)**: 24px/32px, font-weight 600 - section headers
- **Headings (H3)**: 18px/28px, font-weight 600 - subsections
- **Body Large**: 16px/24px, font-weight 400 - primary content
- **Body**: 14px/20px, font-weight 400 - table cells, labels
- **Caption**: 12px/16px, font-weight 400 - helper text, metadata
- **Monospace**: 'JetBrains Mono', 'Consolas', monospace - numerical data, SKU codes

## Layout System

**Spacing Units**: Consistent use of Tailwind units: 4, 6, 8, 12, 16, 24 (p-4, m-6, gap-8, etc.)

**Page Structure**:
- Max container width: max-w-7xl (1280px) for main content
- Full-width containers for data tables
- Sidebar navigation: 280px fixed width on desktop, collapsible on mobile
- Content padding: px-6 md:px-12

**Grid Systems**:
- Configuration cards: 2-column grid on desktop (grid-cols-2)
- Results metrics: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Data tables: Always full-width with horizontal scroll on mobile

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation showing workflow steps (Upload → Configure → Optimize → Results) with progress indicators
- **Step indicators**: Circular numbered badges (1, 2, 3, 4) with connecting lines
- **Active step**: Bold with primary color, completed steps show checkmarks

### Data Tables
- **Header row**: Sticky positioning, background surface color, font-weight 600
- **Row hover**: Subtle background change (bg-gray-50 in light, bg-gray-800 in dark)
- **Editable cells**: Inline input fields with subtle border-bottom indicator
- **Alternating rows**: Optional zebra striping for large tables
- **Action columns**: Right-aligned icons (edit, delete) appearing on row hover

### Input Fields
- **Text inputs**: Border-2, rounded corners (rounded-md), focus ring with primary color
- **Number inputs**: Monospace font, right-aligned for numerical values
- **Labels**: font-weight 500, text-sm, positioned above input with 2-unit gap
- **Helper text**: text-xs, text-gray-600, positioned below input
- **Validation states**: Red border for errors, green for success, with icon indicators

### Cards & Panels
- **Configuration cards**: White surface, rounded-lg, shadow-md, p-6
- **Metric cards**: Prominent number (text-3xl), label below, colored accent bar on left
- **Results panels**: Elevated surface (shadow-lg), clear section dividers

### Buttons
- **Primary**: Filled with primary color, rounded-md, px-6 py-3, font-weight 500
- **Secondary**: Outlined with primary color, transparent background
- **Text buttons**: No border, primary color text, minimal padding
- **Icon buttons**: Square or circular, 40px × 40px touch target
- **Upload button**: Large, dashed border, center-aligned icon and text

### File Upload Zone
- **Drag & drop area**: Dashed border (border-2 border-dashed), rounded-lg, p-12
- **Hover state**: Primary color border, slight background tint
- **Icon**: Upload cloud icon (64px) in muted primary color
- **Text**: "Drag CSV here or click to browse" with supported format helper text

### Results Display
- **Summary metrics**: Grid of 4-6 large number cards showing key outputs
- **Status badge**: Pill-shaped, colored by solver status (green=success, red=failed)
- **Utilization bars**: Horizontal progress bars showing % of volume, weight, budget used
- **Results table**: Full-width, sortable columns, row actions for detailed view

### Modals & Dialogs
- **Backdrop**: Semi-transparent dark overlay (bg-black/50)
- **Dialog**: White surface, rounded-lg, max-w-2xl, shadow-2xl
- **Header**: Primary color background, white text, close icon top-right
- **Actions**: Right-aligned buttons, primary on right

## Page-Specific Designs

### 1. Upload Page (Step 1)
- Center-aligned upload zone taking 60% viewport height
- Sample CSV download link below upload zone
- File validation messages appear inline after selection
- Preview table (first 5 rows) appears after successful upload

### 2. Configuration Page (Step 2)
- **Top section**: Global variables in 2-column card grid
  - Container specs (volume, weight)
  - Budget and lead time
  - Score weights with range sliders (0-1)
- **Bottom section**: Full-width editable data table
  - Column headers with tooltips explaining each field
  - Inline editing for all numeric fields
  - Validation indicators per cell
- **Sticky action bar**: Save changes + Proceed to Optimize buttons at bottom

### 3. Optimization Running Page (Step 3)
- Centered loading indicator with animated circular progress
- Status text showing current optimization phase
- Estimated time remaining
- Cancel button to abort optimization

### 4. Results Page (Step 4)
- **Top metrics row**: 6 key statistics cards
  - Total boxes selected
  - Volume utilization (number + %)
  - Weight utilization (number + %)
  - Total cost vs budget
  - Total profit
  - Optimization score
- **Utilization visualization**: 3 horizontal bars for volume, weight, budget
- **Results table**: Selected SKUs with all relevant columns
- **Action bar**: Download CSV, Download PDF, Print View buttons (sticky top)

## Animations
**Minimal and purposeful only:**
- Page transitions: Simple fade (150ms)
- Button interactions: Scale on press (transform: scale(0.98))
- Table row hover: Smooth background transition (150ms)
- Loading states: Circular spinner, no complex animations
- Success/error states: Simple checkmark/X fade-in

## Responsive Behavior
- **Desktop (lg:)**: Full sidebar navigation, multi-column grids
- **Tablet (md:)**: Collapsible sidebar, 2-column grids reduce to single
- **Mobile (base)**: Hamburger menu, all grids stack to single column
- **Tables**: Horizontal scroll with sticky first column on mobile

## Images
**No hero images for this application.** This is a data-focused business tool where imagery would distract from functionality. All visual communication happens through:
- Data visualization (charts, progress bars)
- Icons for actions and status indicators
- Clean typography and structured layouts

The only graphical elements should be:
- Upload zone icon (cloud/document illustration)
- Empty state illustrations when no data is present
- Status/validation icons throughout the interface