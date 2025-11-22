# StockMaster - Inventory & Stock Management System

## Overview

StockMaster is a comprehensive web-based inventory and stock management system designed for manufacturing and warehouse operations. The application provides role-based access for Inventory Managers and Warehouse Staff to manage products, manufacturing orders, stock movements, purchase orders, sales orders, and contacts. Built as a modern SaaS dashboard with a clean, professional interface following enterprise design patterns inspired by Linear, Notion, Asana, and Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Framework:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS with custom design tokens following a "new-york" style
- Custom theme system supporting light mode with HSL color variables
- Inter font family (Google Fonts) for consistent typography

**Form Management:**
- React Hook Form for performant form state management
- Zod for schema validation with @hookform/resolvers integration
- Custom validation schemas aligned with backend schema definitions

**Design System:**
- Consistent spacing using Tailwind units (2, 4, 6, 8, 12, 16)
- Component variants using class-variance-authority
- Fixed sidebar (256px) with collapsible mobile drawer
- Sticky top bar (h-16) with global search and notifications
- Card-based layouts with rounded corners and subtle shadows

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with TypeScript
- ESM module system throughout the codebase
- Separate development (tsx with HMR) and production build processes
- Custom request/response logging middleware

**Database Layer:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via @neondatabase/serverless)
- Schema-first design with Drizzle Kit for migrations
- In-memory storage implementation for development/testing (located in server/storage.ts)

**Authentication & Security:**
- Session-based authentication using bcryptjs for password hashing
- Password requirements: minimum 8 characters with uppercase, lowercase, numbers, and special characters
- Role-based access control: "Inventory Manager" and "Warehouse Staff"
- Secure credential storage and validation

**API Design:**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Zod schema validation with friendly error messages (zod-validation-error)
- Error handling with appropriate HTTP status codes

### Data Model

**Core Entities:**
- **Users**: Authentication and role management (loginId, email, password hash, role)
- **Products**: Inventory items with SKU, category, unit of measure, quantities (on-hand, reserved, forecasted), location, minimum stock levels
- **Manufacturing Orders**: Production orders with components, operations, and status tracking
- **Stock Moves**: Internal transfers between warehouse locations
- **Purchase Orders**: Vendor orders with line items
- **Sales Orders**: Customer orders with line items
- **Contacts**: Vendors and customers with contact information
- **Company Settings**: Organization profile and configuration

**Key Relationships:**
- Manufacturing Orders contain multiple components and operations
- Purchase/Sales Orders contain multiple line items referencing products
- Products track quantity states across multiple locations

### Routing Architecture

**Authentication Flow:**
- Public routes: `/login`, `/signup`, `/forgot-password`
- Protected routes require authentication, redirecting to `/login` if unauthenticated
- Post-login redirect to `/dashboard`

**Application Routes:**
- `/dashboard` - KPI overview and recent activity
- `/inventory` - Product listing with search/filter
- `/inventory/new` - Create new product
- `/inventory/:id` - Product details with tabs (info, locations, history)
- `/inventory/:id/edit` - Edit product form
- `/manufacturing` - Manufacturing order listing
- `/manufacturing/:id` - Order details with components and operations
- `/stock-moves` - Internal transfer management
- `/purchase` - Purchase order management
- `/sales` - Sales order management
- `/contacts` - Vendor and customer management
- `/settings` - Company profile configuration

### State Management Strategy

**Server State:**
- TanStack Query for API data fetching, caching, and synchronization
- Custom queryClient configuration with explicit refetch policies
- Optimistic updates for improved UX
- Custom query functions with 401 handling

**Client State:**
- React hooks (useState, useContext) for local component state
- Form state managed by React Hook Form
- Toast notifications using custom useToast hook
- Sidebar state persisted via cookies

**URL State:**
- Wouter for routing and URL parameter management
- Search and filter parameters in query strings

## External Dependencies

**UI Component Libraries:**
- @radix-ui/* primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip)
- cmdk for command palette functionality
- react-day-picker for date selection
- embla-carousel-react for carousels
- vaul for drawer components
- lucide-react for consistent iconography

**Database & ORM:**
- drizzle-orm with drizzle-kit for schema management
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session storage (prepared for future use)

**Development Tools:**
- Vite plugins: @vitejs/plugin-react, @replit/vite-plugin-runtime-error-modal
- Replit-specific tooling for development environment
- TypeScript for static type checking
- PostCSS with Tailwind CSS and Autoprefixer

**Utilities:**
- date-fns for date manipulation
- clsx and tailwind-merge (via cn utility) for conditional classnames
- class-variance-authority for component variant management
- nanoid for unique ID generation
- zod-validation-error for user-friendly validation messages

**Build & Runtime:**
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Node.js built-in modules (crypto, fs, path, http)