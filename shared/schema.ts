import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loginId: text("login_id").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products table
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
  minQuantity: integer("min_quantity").default(0),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Manufacturing Orders table
export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  contact: text("contact").notNull(),
  scheduleDate: timestamp("schedule_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, ready, in_progress, done
  quantity: integer("quantity").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  productId: varchar("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertManufacturingOrderSchema = createInsertSchema(manufacturingOrders).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertManufacturingOrder = z.infer<typeof insertManufacturingOrderSchema>;
export type ManufacturingOrder = typeof manufacturingOrders.$inferSelect;

// Stock Moves table
export const stockMoves = pgTable("stock_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  date: timestamp("date").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  productId: varchar("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("draft"), // draft, waiting, ready, done, canceled
  type: text("type").notNull(), // receipt, delivery, internal, adjustment
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockMoveSchema = createInsertSchema(stockMoves).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertStockMove = z.infer<typeof insertStockMoveSchema>;
export type StockMove = typeof stockMoves.$inferSelect;

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  vendor: text("vendor").notNull(),
  orderDate: timestamp("order_date").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, confirmed, received, canceled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Purchase Order Line Items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

// Sales Orders table
export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reference: text("reference").notNull().unique(),
  customer: text("customer").notNull(),
  orderDate: timestamp("order_date").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, confirmed, delivered, canceled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;

// Sales Order Line Items
export const salesOrderItems = pgTable("sales_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: varchar("sales_order_id").references(() => salesOrders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({ id: true });
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;
export type SalesOrderItem = typeof salesOrderItems.$inferSelect;

// Contacts table
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  addressLine: text("address_line"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Company Settings table
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line").notNull(),
  buildingNo: text("building_no"),
  street: text("street"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  country: text("country").notNull(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true });
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

// Manufacturing Order Components
export const manufacturingComponents = pgTable("manufacturing_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manufacturingOrderId: varchar("manufacturing_order_id").references(() => manufacturingOrders.id).notNull(),
  componentName: text("component_name").notNull(),
  requiredQuantity: integer("required_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
});

export const insertManufacturingComponentSchema = createInsertSchema(manufacturingComponents).omit({ id: true });
export type InsertManufacturingComponent = z.infer<typeof insertManufacturingComponentSchema>;
export type ManufacturingComponent = typeof manufacturingComponents.$inferSelect;

// Manufacturing Order Operations
export const manufacturingOperations = pgTable("manufacturing_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  manufacturingOrderId: varchar("manufacturing_order_id").references(() => manufacturingOrders.id).notNull(),
  operationName: text("operation_name").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, paused, done
});

export const insertManufacturingOperationSchema = createInsertSchema(manufacturingOperations).omit({ id: true });
export type InsertManufacturingOperation = z.infer<typeof insertManufacturingOperationSchema>;
export type ManufacturingOperation = typeof manufacturingOperations.$inferSelect;
