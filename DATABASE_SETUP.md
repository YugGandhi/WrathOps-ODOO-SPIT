# Database Setup Guide

## Overview
The application has been updated to connect to a Neon PostgreSQL database instead of using mock data. All backend infrastructure is in place.

## Setup Steps

### 1. Create .env File
Create a `.env` file in the root directory with the following content:

```
DATABASE_URL='postgresql://neondb_owner:npg_oHt5svywcg1T@ep-snowy-rain-a1i0bdms-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### 2. Run Database Migrations
Push the schema to the database:

```bash
npm run db:push
```

This will create all necessary tables:
- users
- products
- warehouses
- receipts
- receipt_line_items
- delivery_orders
- delivery_line_items
- stock_moves
- contacts
- manufacturing_orders
- purchase_orders
- sales_orders
- company_settings
- And related line item tables

### 3. Start the Application
```bash
npm run dev
```

The application will automatically use the database storage if `DATABASE_URL` is set, otherwise it will fall back to in-memory storage.

## What Has Been Completed

### Backend
✅ Database schema updated with:
- Receipts table (with status: Draft, Ready, Done)
- Receipt line items table
- Delivery orders table (with status: Picked, Packed, Validated)
- Delivery line items table
- Warehouses table
- Products table updated with `pricePerUnit` field

✅ Database storage implementation (`server/db-storage.ts`)
- All CRUD operations for receipts, delivery orders, warehouses
- Full implementation using Drizzle ORM

✅ API Routes added (`server/routes.ts`)
- `/api/receipts` - GET, POST, PATCH, DELETE
- `/api/receipts/:id/line-items` - GET, POST, PATCH, DELETE
- `/api/delivery-orders` - GET, POST, PATCH, DELETE
- `/api/delivery-orders/:id/line-items` - GET, POST, PATCH, DELETE
- `/api/warehouses` - GET, POST, PATCH, DELETE

### Storage Layer
✅ Automatic database detection
- Uses `DbStorage` if `DATABASE_URL` is set
- Falls back to `MemStorage` if not set

## What Still Needs to Be Done

### Frontend Updates
The frontend pages still use mock data. They need to be updated to fetch from the API:

1. **Inventory Page** (`client/src/pages/inventory.tsx`)
   - Replace mock data with API call to `/api/products`

2. **Product Form** (`client/src/pages/product-form.tsx`)
   - Replace mock products with API call to `/api/products`
   - Update form submission to use `/api/products` POST/PATCH

3. **Receipts List** (`client/src/pages/purchase.tsx`)
   - Replace mock receipts with API call to `/api/receipts`
   - Include related data (supplier, warehouse) via joins or separate calls

4. **Receipt Form** (`client/src/pages/purchase-form.tsx`)
   - Replace mock data with API calls:
     - `/api/products` for products
     - `/api/contacts?type=Vendor` for suppliers
     - `/api/warehouses` for warehouses
   - Submit to `/api/receipts` and `/api/receipts/:id/line-items`

5. **Receipt Details** (`client/src/pages/receipt-details.tsx`)
   - Fetch from `/api/receipts/:id` and `/api/receipts/:id/line-items`

6. **Delivery Orders List** (`client/src/pages/delivery.tsx`)
   - Replace mock data with API call to `/api/delivery-orders`

7. **Delivery Form** (`client/src/pages/delivery-form.tsx`)
   - Replace mock data with API calls:
     - `/api/products` for products
     - `/api/contacts?type=Customer` for customers
   - Submit to `/api/delivery-orders` and `/api/delivery-orders/:id/line-items`

8. **Delivery Details** (`client/src/pages/delivery-details.tsx`)
   - Fetch from `/api/delivery-orders/:id` and `/api/delivery-orders/:id/line-items`

9. **Stock Moves** (`client/src/pages/stock-moves.tsx`)
   - Replace mock data with API call to `/api/stock-moves`
   - Include product names via joins or separate calls

## API Endpoints Available

### Receipts
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt by ID
- `POST /api/receipts` - Create receipt
- `PATCH /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt
- `GET /api/receipts/:id/line-items` - Get receipt line items
- `POST /api/receipts/:id/line-items` - Create line item
- `PATCH /api/receipts/line-items/:id` - Update line item
- `DELETE /api/receipts/line-items/:id` - Delete line item

### Delivery Orders
- `GET /api/delivery-orders` - Get all delivery orders
- `GET /api/delivery-orders/:id` - Get delivery order by ID
- `POST /api/delivery-orders` - Create delivery order
- `PATCH /api/delivery-orders/:id` - Update delivery order
- `DELETE /api/delivery-orders/:id` - Delete delivery order
- `GET /api/delivery-orders/:id/line-items` - Get delivery line items
- `POST /api/delivery-orders/:id/line-items` - Create line item
- `PATCH /api/delivery-orders/line-items/:id` - Update line item
- `DELETE /api/delivery-orders/line-items/:id` - Delete line item

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PATCH /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

## Notes

- The database connection uses Neon's serverless driver
- All timestamps are handled automatically by the database
- The schema includes proper relationships and constraints
- Stock moves are automatically created when receipts/deliveries are marked as Done/Validated (this logic needs to be implemented in the API handlers)

