Video Link: https://www.loom.com/share/ad64711185594f55843443799ae1bc05


# StockMaster - Inventory Management System

A modern inventory management system for tracking products, warehouses, receipts, and delivery orders.

## What It Does

StockMaster helps you manage:
- **Products & Inventory** - Track stock levels, locations, and pricing
- **Warehouses & Locations** - Organize inventory across multiple warehouses
- **Receipts** - Manage incoming goods with Draft → Ready → Done workflow
- **Delivery Orders** - Track outgoing shipments with Pick → Pack → Validate process
- **Stock Moves** - Complete history of all inventory transfers
- **Manufacturing** - Production order management
- **Sales & Purchases** - Customer and vendor order tracking
- **User Management** - Secure authentication with role-based access

## Tech Stack

- **Frontend**: React 18, TypeScript, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Build Tool**: Vite

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create a `.env` file:
```env
DATABASE_URL='your-postgresql-connection-string'
```

### 3. Setup Database
```bash
npm run db:push    # Create tables
npm run seed       # Add sample data
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:5000


## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Update database schema
- `npm run seed` - Seed database with sample data

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schema
└── seed.ts         # Database seeding script
```

---

For detailed setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)
