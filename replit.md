# StockMaster - Inventory & Stock Management System

## Overview

StockMaster is a comprehensive web-based inventory and stock management system designed for efficient warehouse operations, manufacturing orders, and purchase/sales tracking. The application follows a modern SaaS admin dashboard aesthetic with a desktop-first approach, optimized for data-dense operational workflows.

The system manages the complete lifecycle of inventory operations including:
- Product inventory tracking with multi-location support
- Manufacturing order management with components and operations
- Stock movement tracking (receipts, deliveries, internal transfers, adjustments)
- Purchase order management for vendor procurement
- Sales order management for customer deliveries
- Contact management for vendors and customers
- Company settings and configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured for fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing (alternative to React Router)
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Design system follows "New York" style variant with neutral color palette
- Custom CSS variables for theming support (light/dark modes)
- Component architecture emphasizes reusability across all modules

**State Management Pattern**
- Server state managed via React Query with dedicated hooks per domain entity
- Form state handled locally with React Hook Form and Zod validation
- Authentication state persisted in localStorage (userId)
- No global client state management library - leverages React Query's caching

**Design Principles**
- Desktop-first responsive layout with mobile support
- Fixed left sidebar (240px) with collapsible mobile view
- Top bar (64px) with global search and notifications
- Card-based content sections with consistent spacing (Tailwind units: 2, 4, 6, 8, 12, 16)
- Data-dense tables with sorting, filtering, and pagination capabilities
- Status badge system for visual workflow state indication

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- Dual-mode server setup: development (with Vite middleware) and production (static file serving)
- RESTful API design with conventional HTTP methods
- Session-based authentication (not yet fully implemented - uses localStorage)

**API Structure**
- `/api/auth/*` - Authentication endpoints (signup, login)
- `/api/products/*` - Product CRUD operations
- `/api/manufacturing-orders/*` - Manufacturing order management
- `/api/stock-moves/*` - Stock movement tracking
- `/api/purchase-orders/*` - Purchase order management
- `/api/sales-orders/*` - Sales order management
- `/api/contacts/*` - Contact management
- `/api/settings/*` - Company settings

**Data Layer Pattern**
- **Drizzle ORM** for type-safe database operations
- Storage abstraction layer (`IStorage` interface) for data access
- Schema-first design with Zod validation for request/response types
- Shared schema definitions between client and server (`shared/schema.ts`)

**Database Schema Design**
- **Users**: Authentication and user profiles
- **Products**: Inventory items with SKU, quantities (on-hand, reserved, forecasted), and location tracking
- **Manufacturing Orders**: Production planning with reference numbers, scheduling, and status workflow
- **Manufacturing Components**: Bill of materials for manufacturing orders
- **Manufacturing Operations**: Work center operations for production flow
- **Stock Moves**: Movement tracking (receipts, deliveries, transfers, adjustments)
- **Purchase Orders**: Vendor procurement with line items
- **Sales Orders**: Customer orders with line items
- **Contacts**: Unified vendor/customer management
- **Company Settings**: Organization configuration and branding

**Authentication & Security**
- Password hashing using bcryptjs (10 rounds)
- User identification via unique login IDs
- Session management via connect-pg-simple (PostgreSQL session store)
- Input validation with Zod schemas on all endpoints

### External Dependencies

**Database**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- Connection managed through `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (`drizzle-kit push`)

**UI Component Libraries**
- **Radix UI** primitives for accessible, unstyled components (dialogs, dropdowns, popovers, etc.)
- **Lucide React** for consistent iconography throughout the application
- **date-fns** for date manipulation and formatting

**Development Tools**
- **TypeScript** for type safety across the entire stack
- **Vite plugins**: Runtime error overlay, Replit-specific tooling (cartographer, dev banner)
- **ESBuild** for production server bundling

**Form Management**
- **React Hook Form** with Zod resolvers for declarative form validation
- Schema validation shared between client and server for consistency

**Styling Utilities**
- **class-variance-authority** for component variant management
- **clsx** and **tailwind-merge** for conditional className composition
- **cmdk** for command palette functionality

**Build & Deployment**
- Development: `tsx` for running TypeScript directly with hot reload via Vite
- Production: Vite builds client, ESBuild bundles server into single output file
- Static assets served from `dist/public` in production mode