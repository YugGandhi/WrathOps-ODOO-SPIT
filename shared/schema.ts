import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loginId: text("login_id").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'Inventory Manager' or 'Warehouse Staff'
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["Inventory Manager", "Warehouse Staff"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  description: text("description"),
  onHandQuantity: integer("on_hand_quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  forecastedQuantity: integer("forecasted_quantity").notNull().default(0),
  location: text("location").notNull(),
  minimumQuantity: integer("minimum_quantity").default(0),
  preferredSupplier: text("preferred_supplier"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Manufacturing Orders
export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  contact: text("contact").notNull(),
  scheduleDate: timestamp("schedule_date").notNull(),
  status: text("status").notNull(), // Draft, Ready, In Progress, Done
  quantity: integer("quantity").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  productId: varchar("product_id"),
});

export const insertManufacturingOrderSchema = createInsertSchema(manufacturingOrders).omit({ id: true });
export type InsertManufacturingOrder = z.infer<typeof insertManufacturingOrderSchema>;
export type ManufacturingOrder = typeof manufacturingOrders.$inferSelect;

// Manufacturing Order Components
export const moComponents = pgTable("mo_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moId: varchar("mo_id").notNull(),
  componentName: text("component_name").notNull(),
  requiredQuantity: integer("required_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
});

export const insertMOComponentSchema = createInsertSchema(moComponents).omit({ id: true });
export type InsertMOComponent = z.infer<typeof insertMOComponentSchema>;
export type MOComponent = typeof moComponents.$inferSelect;

// Manufacturing Order Operations
export const moOperations = pgTable("mo_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moId: varchar("mo_id").notNull(),
  name: text("name").notNull(), // Wood Cutting, Assembly, Inspection
  status: text("status").notNull(), // Pending, In Progress, Paused, Done
  sequence: integer("sequence").notNull(),
});

export const insertMOOperationSchema = createInsertSchema(moOperations).omit({ id: true });
export type InsertMOOperation = z.infer<typeof insertMOOperationSchema>;
export type MOOperation = typeof moOperations.$inferSelect;

// Stock Moves
export const stockMoves = pgTable("stock_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  reference: text("reference").notNull().unique(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull(), // Draft, Waiting, Ready, Done, Canceled
  type: text("type").notNull(), // Receipt, Delivery, Internal, Adjustment
});

export const insertStockMoveSchema = createInsertSchema(stockMoves).omit({ id: true });
export type InsertStockMove = z.infer<typeof insertStockMoveSchema>;
export type StockMove = typeof stockMoves.$inferSelect;

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  vendorId: varchar("vendor_id").notNull(),
  orderDate: timestamp("order_date").notNull(),
  status: text("status").notNull(), // Draft, Confirmed, Received, Canceled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Purchase Order Line Items
export const poLineItems = pgTable("po_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poId: varchar("po_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertPOLineItemSchema = createInsertSchema(poLineItems).omit({ id: true });
export type InsertPOLineItem = z.infer<typeof insertPOLineItemSchema>;
export type POLineItem = typeof poLineItems.$inferSelect;

// Sales Orders
export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  customerId: varchar("customer_id").notNull(),
  orderDate: timestamp("order_date").notNull(),
  status: text("status").notNull(), // Draft, Confirmed, Delivered, Canceled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({ id: true });
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;

// Sales Order Line Items
export const soLineItems = pgTable("so_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  soId: varchar("so_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertSOLineItemSchema = createInsertSchema(soLineItems).omit({ id: true });
export type InsertSOLineItem = z.infer<typeof insertSOLineItemSchema>;
export type SOLineItem = typeof soLineItems.$inferSelect;

// Contacts (Vendors and Customers)
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  addressLine: text("address_line"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  country: text("country"),
  type: text("type").notNull(), // Vendor, Customer, Both
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Company Settings
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line"),
  buildingNo: text("building_no"),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  country: text("country"),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true });
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
