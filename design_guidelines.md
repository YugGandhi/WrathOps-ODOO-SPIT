# StockMaster – Design Guidelines

## Design Approach
**System-Based Approach**: Modern SaaS Admin Dashboard aesthetic drawing from enterprise productivity tools (Notion, Linear, Asana). Professional, data-dense interface optimized for desktop-first workflows with responsive mobile support.

## Core Design Principles
- **Professional & Clean**: Enterprise SaaS aesthetic with clear information hierarchy
- **Data-Dense**: Optimized for displaying tables, metrics, and operational data
- **Efficiency-Focused**: Quick access to actions, minimal clicks for common workflows
- **Consistent Patterns**: Reusable components across all modules

## Layout System

**Primary Structure**:
- Fixed left sidebar (240px desktop, collapsible on mobile)
- Top bar (64px height) with search, notifications, user profile
- Main content area with fluid width, max-width constraints for readability
- Card-based sections within main content

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Page margins: p-6 to p-8

## Typography

**Font Stack**: 
- Primary: Inter or similar modern sans-serif via Google Fonts
- Monospace: For codes/references (SKU, Reference numbers)

**Hierarchy**:
- Page titles: text-2xl to text-3xl, font-semibold
- Card headers: text-lg, font-semibold
- Table headers: text-sm, font-medium, uppercase tracking
- Body text: text-sm to text-base
- Helper text: text-xs to text-sm, muted

## Component Library

### Navigation
- **Sidebar**: Vertical nav with icons + labels, active state highlighting, collapsible on mobile
- **Top Bar**: Search input (prominent), notification bell icon with badge, user avatar with dropdown

### Data Display
- **Tables**: Striped or bordered rows, sticky headers, sortable columns, row actions (view/edit/delete icons)
- **Cards**: Soft shadows (shadow-sm), rounded corners (rounded-lg), white background
- **KPI Cards**: Large numbers, descriptive labels, optional trend indicators
- **Status Badges**: Pill-shaped, small (text-xs), color-coded by status (Draft/Confirmed/Done/Canceled)

### Forms
- **Input Fields**: Clear labels above, border on all sides, focus states with ring
- **Dropdowns**: Standard select styling with chevron icon
- **Buttons**: 
  - Primary: Solid fill for main actions
  - Secondary: Outlined for secondary actions
  - Sizes: Small (forms), Medium (default), Large (CTAs)
- **Validation**: Inline error messages below fields, red border on error state

### Interactive Elements
- **Modals**: Centered overlay with backdrop blur, max-width-lg to max-width-2xl, close icon top-right
- **Tabs**: Underlined active tab, equal spacing
- **Kanban Cards**: Draggable cards with product info, status, and quick actions
- **Action Buttons**: Icon buttons for quick actions (edit, delete, view)

### Feedback
- **Loading States**: Skeleton loaders for tables, spinner for buttons during actions
- **Toast Notifications**: Top-right corner, auto-dismiss for success/info, persistent for errors
- **Empty States**: Centered message with icon and CTA button

## Module-Specific Patterns

### Authentication Pages
- Centered card layout (max-w-md)
- Logo + app name at top
- Generous spacing between form elements
- Link styling for "Forget Password" and "Sign Up"

### Dashboard
- Grid layout for KPI cards (grid-cols-2 lg:grid-cols-4)
- Horizontal filter bar above operations table
- Timeline/table hybrid for recent operations

### List Views (Inventory, Orders, etc.)
- Search bar and filters at top (sticky optional)
- Data table with pagination at bottom
- Row actions as icon buttons on hover or always visible

### Detail Pages
- Breadcrumb navigation
- Tab navigation for sections (Overview, Components, Operations)
- Action buttons in top-right corner (Edit, Validate, etc.)

### Forms (Create/Edit)
- Two-column layout for wide screens (grid-cols-2 gap-6)
- Full-width for critical fields
- Line items table with add/remove row functionality
- Footer with Save/Cancel buttons (right-aligned)

## Responsive Behavior
- **Desktop (lg+)**: Full sidebar visible, multi-column layouts, full tables
- **Tablet (md)**: Collapsible sidebar, 2-column forms become 1-column, horizontal scroll for tables
- **Mobile**: Hamburger menu, single column layouts, card-based list items instead of tables where appropriate

## Accessibility
- Sufficient color contrast for all text
- Keyboard navigation for all interactive elements
- Focus indicators on all focusable elements
- ARIA labels for icon-only buttons

## Images
No hero images or marketing imagery required. This is a data-focused application interface. Use icons throughout for navigation and actions (from Heroicons or Lucide React icon set).