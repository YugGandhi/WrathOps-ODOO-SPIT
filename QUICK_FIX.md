# QUICK FIX - Database Setup

## The Problem
Your database tables don't exist, which is why all API calls return empty arrays.

## The Solution

### Option 1: Use Drizzle Kit (Recommended)
Run this command and answer the prompts:
```bash
npm run db:push
```
- When asked about `location_id` column, select: **"+ location_id create column"**
- When warned about data loss, type: **"Yes, I want to remove 1 column"** (or just "Yes")

Then seed the database:
```bash
npm run seed
```

### Option 2: Manual SQL (If Option 1 doesn't work)
1. Connect to your Neon database
2. Run the SQL in `create-all-tables.sql`
3. Then run: `npm run seed`

## Verify It Worked
After seeding, refresh your browser. You should see:
- Products in the inventory page
- Receipts in the receipts page
- Data in all other pages

## Still Not Working?
Check the browser console for errors and verify:
1. The dev server is running: `npm run dev`
2. The `.env` file has `DATABASE_URL` set
3. The database connection is working

