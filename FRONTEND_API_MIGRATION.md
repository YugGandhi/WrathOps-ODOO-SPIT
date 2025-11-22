# Frontend API Migration Progress

## ✅ Completed

### Authentication
- ✅ Login - Connected to `/api/auth/login`
- ✅ Signup - Connected to `/api/auth/signup`
- ✅ Forgot Password - Connected to `/api/auth/forgot-password`
- ✅ Reset Password - Connected to `/api/auth/reset-password`
- ✅ Logout - Added to top nav, calls `/api/auth/logout`

### Backend
- ✅ Password reset token functionality added to schema
- ✅ Forgot password endpoint (`POST /api/auth/forgot-password`)
- ✅ Reset password endpoint (`POST /api/auth/reset-password`)
- ✅ Logout endpoint (`POST /api/auth/logout`)
- ✅ All storage methods for password reset implemented

### Pages Updated
- ✅ Inventory page - Now fetches from `/api/products` using React Query

## 🔄 In Progress / Remaining

### Pages That Need Mock Data Removal

1. **Product Pages**
   - `product-form.tsx` - Remove mock products, fetch from `/api/products`
   - `product-details.tsx` - Fetch from `/api/products/:id`

2. **Receipt Pages**
   - `purchase.tsx` - Fetch from `/api/receipts` with line items
   - `purchase-form.tsx` - Fetch products, suppliers, warehouses from API
   - `receipt-details.tsx` - Fetch from `/api/receipts/:id` with line items

3. **Delivery Pages**
   - `delivery.tsx` - Fetch from `/api/delivery-orders`
   - `delivery-form.tsx` - Fetch products, customers from API
   - `delivery-details.tsx` - Fetch from `/api/delivery-orders/:id`

4. **Stock Moves**
   - `stock-moves.tsx` - Fetch from `/api/stock-moves` with product names
   - `stock-move-form.tsx` - Fetch products, locations from API

5. **Other Pages**
   - `dashboard.tsx` - Fetch summary data from API
   - `manufacturing.tsx` - Fetch from `/api/manufacturing-orders`
   - `sales.tsx` - Fetch from `/api/sales-orders`
   - `contacts.tsx` - Fetch from `/api/contacts`

## Pattern to Follow

For each page, follow this pattern:

```typescript
import { useQuery } from "@tanstack/react-query";

// Replace mock data with:
const { data, isLoading, error } = useQuery({
  queryKey: ["resource-name"],
  queryFn: async () => {
    const response = await fetch("/api/resource-name");
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },
});

// Handle loading and error states
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading data</div>;

// Use data instead of mock data
```

## API Endpoints Available

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Receipts
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt by ID
- `POST /api/receipts` - Create receipt
- `PATCH /api/receipts/:id` - Update receipt
- `GET /api/receipts/:id/line-items` - Get receipt line items
- `POST /api/receipts/:id/line-items` - Create line item

### Delivery Orders
- `GET /api/delivery-orders` - Get all delivery orders
- `GET /api/delivery-orders/:id` - Get delivery order by ID
- `POST /api/delivery-orders` - Create delivery order
- `PATCH /api/delivery-orders/:id` - Update delivery order
- `GET /api/delivery-orders/:id/line-items` - Get delivery line items

### Contacts (Suppliers/Customers)
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts?type=Vendor` - Get suppliers
- `GET /api/contacts?type=Customer` - Get customers
- `POST /api/contacts` - Create contact

### Warehouses
- `GET /api/warehouses` - Get all warehouses

### Stock Moves
- `GET /api/stock-moves` - Get all stock moves

## Notes

- All pages should use React Query for data fetching
- Handle loading and error states appropriately
- Remove all `const mockData = [...]` declarations
- Update field names to match database schema (e.g., `onHandQuantity` instead of `onHand`)
- For related data (like product names in stock moves), either:
  - Join in the backend API
  - Fetch separately and merge in the frontend
  - Use React Query's dependent queries

