import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql as drizzleSql } from "drizzle-orm";
import {
  users,
  products,
  manufacturingOrders,
  moComponents,
  moOperations,
  stockMoves,
  purchaseOrders,
  poLineItems,
  salesOrders,
  soLineItems,
  contacts,
  companySettings,
  warehouses,
  locations,
  receipts,
  receiptLineItems,
  deliveryOrders,
  deliveryLineItems,
  passwordResetTokens,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type ManufacturingOrder,
  type InsertManufacturingOrder,
  type MOComponent,
  type InsertMOComponent,
  type MOOperation,
  type InsertMOOperation,
  type StockMove,
  type InsertStockMove,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type POLineItem,
  type InsertPOLineItem,
  type SalesOrder,
  type InsertSalesOrder,
  type SOLineItem,
  type InsertSOLineItem,
  type Contact,
  type InsertContact,
  type CompanySettings,
  type InsertCompanySettings,
  type Warehouse,
  type InsertWarehouse,
  type Location,
  type InsertLocation,
  type Receipt,
  type InsertReceipt,
  type ReceiptLineItem,
  type InsertReceiptLineItem,
  type DeliveryOrder,
  type InsertDeliveryOrder,
  type DeliveryLineItem,
  type InsertDeliveryLineItem,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByLoginId(loginId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.loginId, loginId)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.update(users)
      .set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async setResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiresAt })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users)
      .where(and(
        eq(users.resetToken, token),
        drizzleSql`${users.resetTokenExpiry} > NOW()`
      ))
      .limit(1);
    return result[0];
  }

  async clearResetToken(userId: string): Promise<void> {
    await db.update(users)
      .set({ resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, userId));
  }

  async generateAndStoreOTP(userId: string): Promise<{ otp: string; token: string }> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate reset token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
    
    // Delete any existing OTPs for this user
    await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));
    
    // Store OTP and token
    await db.insert(passwordResetTokens).values({
      userId,
      otp,
      token,
      expiresAt,
      used: 0,
    });
    
    return { otp, token };
  }

  async verifyOTP(email: string, otp: string): Promise<{ valid: boolean; token?: string }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return { valid: false };
    }
    
    const result = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.userId, user.id),
        eq(passwordResetTokens.otp, otp),
        eq(passwordResetTokens.used, 0),
        drizzleSql`${passwordResetTokens.expiresAt} > NOW()`
      ))
      .limit(1);
    
    if (result.length === 0) {
      return { valid: false };
    }
    
    // Mark OTP as used
    await db.update(passwordResetTokens)
      .set({ used: 1 })
      .where(eq(passwordResetTokens.id, result[0].id));
    
    return { valid: true, token: result[0].token };
  }

  async getUserByResetTokenFromOTP(token: string): Promise<User | undefined> {
    const result = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, 1),
        drizzleSql`${passwordResetTokens.expiresAt} > NOW()`
      ))
      .limit(1);
    
    if (result.length === 0) {
      return undefined;
    }
    
    return await this.getUser(result[0].userId);
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Manufacturing Orders
  async getAllManufacturingOrders(): Promise<ManufacturingOrder[]> {
    return await db.select().from(manufacturingOrders);
  }

  async getManufacturingOrder(id: string): Promise<ManufacturingOrder | undefined> {
    const result = await db.select().from(manufacturingOrders).where(eq(manufacturingOrders.id, id)).limit(1);
    return result[0];
  }

  async createManufacturingOrder(mo: InsertManufacturingOrder): Promise<ManufacturingOrder> {
    const result = await db.insert(manufacturingOrders).values(mo).returning();
    return result[0];
  }

  async updateManufacturingOrder(id: string, mo: Partial<InsertManufacturingOrder>): Promise<ManufacturingOrder | undefined> {
    const result = await db.update(manufacturingOrders)
      .set(mo)
      .where(eq(manufacturingOrders.id, id))
      .returning();
    return result[0];
  }

  // MO Components
  async getMOComponents(moId: string): Promise<MOComponent[]> {
    return await db.select().from(moComponents).where(eq(moComponents.moId, moId));
  }

  async createMOComponent(component: InsertMOComponent): Promise<MOComponent> {
    const result = await db.insert(moComponents).values(component).returning();
    return result[0];
  }

  // MO Operations
  async getMOOperations(moId: string): Promise<MOOperation[]> {
    return await db.select().from(moOperations).where(eq(moOperations.moId, moId));
  }

  async createMOOperation(operation: InsertMOOperation): Promise<MOOperation> {
    const result = await db.insert(moOperations).values(operation).returning();
    return result[0];
  }

  async updateMOOperation(id: string, operation: Partial<InsertMOOperation>): Promise<MOOperation | undefined> {
    const result = await db.update(moOperations)
      .set(operation)
      .where(eq(moOperations.id, id))
      .returning();
    return result[0];
  }

  // Stock Moves
  async getAllStockMoves(): Promise<StockMove[]> {
    return await db.select().from(stockMoves).orderBy(stockMoves.date);
  }

  async getStockMove(id: string): Promise<StockMove | undefined> {
    const result = await db.select().from(stockMoves).where(eq(stockMoves.id, id)).limit(1);
    return result[0];
  }

  async createStockMove(move: InsertStockMove): Promise<StockMove> {
    const result = await db.insert(stockMoves).values(move).returning();
    return result[0];
  }

  // Purchase Orders
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders);
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
    return result[0];
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const result = await db.insert(purchaseOrders).values(po).returning();
    return result[0];
  }

  async updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const result = await db.update(purchaseOrders)
      .set(po)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return result[0];
  }

  // PO Line Items
  async getPOLineItems(poId: string): Promise<POLineItem[]> {
    return await db.select().from(poLineItems).where(eq(poLineItems.poId, poId));
  }

  async createPOLineItem(item: InsertPOLineItem): Promise<POLineItem> {
    const result = await db.insert(poLineItems).values(item).returning();
    return result[0];
  }

  // Sales Orders
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders);
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const result = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1);
    return result[0];
  }

  async createSalesOrder(so: InsertSalesOrder): Promise<SalesOrder> {
    const result = await db.insert(salesOrders).values(so).returning();
    return result[0];
  }

  async updateSalesOrder(id: string, so: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const result = await db.update(salesOrders)
      .set(so)
      .where(eq(salesOrders.id, id))
      .returning();
    return result[0];
  }

  // SO Line Items
  async getSOLineItems(soId: string): Promise<SOLineItem[]> {
    return await db.select().from(soLineItems).where(eq(soLineItems.soId, soId));
  }

  async createSOLineItem(item: InsertSOLineItem): Promise<SOLineItem> {
    const result = await db.insert(soLineItems).values(item).returning();
    return result[0];
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await db.update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const result = await db.select().from(companySettings).limit(1);
    return result[0];
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    if (existing) {
      const result = await db.update(companySettings)
        .set(settings)
        .where(eq(companySettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(companySettings).values(settings).returning();
      return result[0];
    }
  }

  // Warehouses
  async getAllWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses);
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    return result[0];
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const result = await db.insert(warehouses).values(warehouse).returning();
    return result[0];
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const result = await db.update(warehouses)
      .set(warehouse)
      .where(eq(warehouses.id, id))
      .returning();
    return result[0];
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    const result = await db.delete(warehouses).where(eq(warehouses.id, id)).returning();
    return result.length > 0;
  }

  // Receipts
  async getAllReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts).orderBy(receipts.receiptDate);
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);
    return result[0];
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const result = await db.insert(receipts).values(receipt).returning();
    return result[0];
  }

  async updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    const result = await db.update(receipts)
      .set({ ...receipt, updatedAt: new Date() })
      .where(eq(receipts.id, id))
      .returning();
    return result[0];
  }

  async deleteReceipt(id: string): Promise<boolean> {
    const result = await db.delete(receipts).where(eq(receipts.id, id)).returning();
    return result.length > 0;
  }

  // Receipt Line Items
  async getReceiptLineItems(receiptId: string): Promise<ReceiptLineItem[]> {
    return await db.select().from(receiptLineItems).where(eq(receiptLineItems.receiptId, receiptId));
  }

  async createReceiptLineItem(item: InsertReceiptLineItem): Promise<ReceiptLineItem> {
    const result = await db.insert(receiptLineItems).values(item).returning();
    return result[0];
  }

  async updateReceiptLineItem(id: string, item: Partial<InsertReceiptLineItem>): Promise<ReceiptLineItem | undefined> {
    const result = await db.update(receiptLineItems)
      .set(item)
      .where(eq(receiptLineItems.id, id))
      .returning();
    return result[0];
  }

  async deleteReceiptLineItem(id: string): Promise<boolean> {
    const result = await db.delete(receiptLineItems).where(eq(receiptLineItems.id, id)).returning();
    return result.length > 0;
  }

  // Delivery Orders
  async getAllDeliveryOrders(): Promise<DeliveryOrder[]> {
    return await db.select().from(deliveryOrders).orderBy(deliveryOrders.deliveryDate);
  }

  async getDeliveryOrder(id: string): Promise<DeliveryOrder | undefined> {
    const result = await db.select().from(deliveryOrders).where(eq(deliveryOrders.id, id)).limit(1);
    return result[0];
  }

  async createDeliveryOrder(order: InsertDeliveryOrder): Promise<DeliveryOrder> {
    const result = await db.insert(deliveryOrders).values(order).returning();
    return result[0];
  }

  async updateDeliveryOrder(id: string, order: Partial<InsertDeliveryOrder>): Promise<DeliveryOrder | undefined> {
    const result = await db.update(deliveryOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(deliveryOrders.id, id))
      .returning();
    return result[0];
  }

  async deleteDeliveryOrder(id: string): Promise<boolean> {
    const result = await db.delete(deliveryOrders).where(eq(deliveryOrders.id, id)).returning();
    return result.length > 0;
  }

  // Delivery Line Items
  async getDeliveryLineItems(deliveryId: string): Promise<DeliveryLineItem[]> {
    return await db.select().from(deliveryLineItems).where(eq(deliveryLineItems.deliveryId, deliveryId));
  }

  async createDeliveryLineItem(item: InsertDeliveryLineItem): Promise<DeliveryLineItem> {
    const result = await db.insert(deliveryLineItems).values(item).returning();
    return result[0];
  }

  async updateDeliveryLineItem(id: string, item: Partial<InsertDeliveryLineItem>): Promise<DeliveryLineItem | undefined> {
    const result = await db.update(deliveryLineItems)
      .set(item)
      .where(eq(deliveryLineItems.id, id))
      .returning();
    return result[0];
  }

  async deleteDeliveryLineItem(id: string): Promise<boolean> {
    const result = await db.delete(deliveryLineItems).where(eq(deliveryLineItems.id, id)).returning();
    return result.length > 0;
  }
}

