# StockMaster Design Guidelines

## Design Approach

**Selected Approach:** Design System - Enterprise SaaS Dashboard  
**Primary References:** Linear (navigation/typography), Notion (clean layouts), Asana (data tables), Stripe Dashboard (professional aesthetic)

This is a utility-focused, data-intensive application prioritizing efficiency and learnability over visual novelty.

---

## Typography

**Font System:** Inter (Google Fonts)
- Headings: 600 weight, sizes 2xl-3xl
- Body: 400 weight, base size
- Labels/Meta: 500 weight, sm size
- Data/Numbers: 500-600 weight for emphasis

**Hierarchy:**
- Page titles: text-2xl font-semibold
- Section headers: text-lg font-semibold  
- Card titles: text-base font-medium
- Table headers: text-sm font-medium uppercase tracking-wide
- Body text: text-sm
- Helper text: text-xs text-gray-500

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16 (p-4, m-6, gap-8, etc.)

**Structure:**
- Sidebar: Fixed 256px (w-64), dark surface
- Top bar: h-16, sticky, light surface with border-b
- Main content: p-6 to p-8 container
- Cards: p-6, rounded-lg, shadow-sm
- Between cards/sections: space-y-6

**Grid System:**
- Dashboard KPI cards: grid-cols-2 lg:grid-cols-5, gap-4
- Form layouts: grid-cols-1 md:grid-cols-2, gap-6
- Table actions: flex gap-2

---

## Component Library

### Navigation
**Sidebar:**
- Each item: px-4 py-3, rounded-md, flex items-center gap-3
- Icons: w-5 h-5, left-aligned
- Active state: distinct background, font-medium
- Grouped sections with subtle dividers (my-2)
- User profile at bottom: p-4, border-t

**Top Bar:**
- Search: w-96, rounded-full, with icon prefix
- Icons (notifications/profile): w-10 h-10 clickable areas
- Breadcrumbs when needed: text-sm, separated by chevrons

### Data Display
**Tables:**
- Header: bg-gray-50, text-xs uppercase, py-3 px-6
- Rows: py-4 px-6, border-b, hover:bg-gray-50
- Sticky header on scroll
- Action column: right-aligned, flex gap-2
- Status badges: px-3 py-1, rounded-full, text-xs font-medium
- Pagination: bottom, centered, gap-2 between controls

**Cards (KPIs/Stats):**
- Border, rounded-lg, p-6
- Title: text-sm text-gray-600
- Value: text-3xl font-semibold
- Trend indicator: text-sm with arrow icon
- Icon in top-right: w-8 h-8, muted color

**Kanban Columns:**
- min-w-80, bg-gray-50, rounded-lg, p-4
- Cards within: bg-white, p-4, rounded-md, shadow-sm, mb-3
- Drag indicators on hover

### Forms
**Input Fields:**
- h-10 for text inputs, px-4, border, rounded-md
- Labels: text-sm font-medium, mb-2
- Helper text: text-xs text-gray-500, mt-1
- Error states: border-red-500, text-red-600 message
- Disabled: bg-gray-50, cursor-not-allowed

**Buttons:**
- Primary: px-4 py-2, rounded-md, font-medium
- Secondary: border variant
- Icon buttons: w-9 h-9, rounded-md
- Groups: flex gap-2

**Line Items Table (Orders):**
- Embedded in form cards
- Columns: Product (flex-1), Quantity (w-24), Price (w-32), Subtotal (w-32), Delete (w-10)
- Add row button below table
- Totals section: right-aligned, space-y-2

### Modals & Panels
**Modals:**
- max-w-2xl, centered, p-6
- Header: text-xl font-semibold, mb-4
- Footer: flex justify-end gap-3, pt-4, border-t

**Side Panels (Details):**
- Fixed right, w-96 to w-1/3, full-height
- Close button: top-right
- Scrollable content area
- Tabs if multiple sections

### Filters
**Filter Bar:**
- Horizontal layout on desktop: flex gap-4, items-end, mb-6
- Each filter: min-w-48
- Clear filters button: text-sm, text-blue-600

### Status System
- Draft: gray badge
- Waiting/Pending: yellow
- Ready/Confirmed: blue  
- In Progress: purple
- Done/Delivered: green
- Canceled: red

---

## Role-Based UI

**Visual Indicators:**
- Disabled menu items: opacity-50, cursor-not-allowed
- Hidden sections: display: none (not just disabled)
- Role badge in user profile dropdown
- Warehouse Staff sees simplified dashboard with focus widget

---

## Interactions

**Loading States:**
- Tables: Skeleton rows (h-12, bg-gray-200, rounded, animate-pulse)
- Cards: Shimmer effect on content area
- Buttons: Spinner icon replaces text, disabled state

**Validation:**
- Real-time for email/password patterns
- Red border + error message below field
- Success: green checkmark icon in input

**Hover States:**
- Table rows: subtle bg-gray-50
- Cards: slight shadow increase
- Buttons: darken/lighten 10%

**No complex animations** - instant state changes, simple transitions (150ms) on interactive elements only

---

## Icons

**Library:** Heroicons (via CDN)
- Outline style for navigation/general UI
- Solid style for filled states/active items
- Size: w-5 h-5 standard, w-4 h-4 for inline

---

## Images

**No hero images** - This is a dashboard application
**Product images:** In product details/lists - square aspect ratio, rounded corners, max-w-24 thumbnails
**Empty states:** Simple centered illustrations (icons + text) for empty tables/lists

---

## Responsive Behavior

- **Desktop (lg:):** Full sidebar, multi-column layouts
- **Tablet (md:):** Collapsed sidebar (hamburger), 2-column forms
- **Mobile:** Stack everything, full-width tables with horizontal scroll, bottom sheet modals