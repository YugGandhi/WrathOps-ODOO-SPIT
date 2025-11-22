import {
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
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByLoginId(loginId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  updateUserPassword(userId: string, newPassword: string): Promise<User | undefined>;
  setResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: string): Promise<void>;
  // OTP methods
  generateAndStoreOTP(userId: string): Promise<{ otp: string; token: string }>;
  verifyOTP(email: string, otp: string): Promise<{ valid: boolean; token?: string }>;
  getUserByResetTokenFromOTP(token: string): Promise<User | undefined>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Manufacturing Orders
  getAllManufacturingOrders(): Promise<ManufacturingOrder[]>;
  getManufacturingOrder(id: string): Promise<ManufacturingOrder | undefined>;
  createManufacturingOrder(mo: InsertManufacturingOrder): Promise<ManufacturingOrder>;
  updateManufacturingOrder(id: string, mo: Partial<InsertManufacturingOrder>): Promise<ManufacturingOrder | undefined>;

  // MO Components
  getMOComponents(moId: string): Promise<MOComponent[]>;
  createMOComponent(component: InsertMOComponent): Promise<MOComponent>;

  // MO Operations
  getMOOperations(moId: string): Promise<MOOperation[]>;
  createMOOperation(operation: InsertMOOperation): Promise<MOOperation>;
  updateMOOperation(id: string, operation: Partial<InsertMOOperation>): Promise<MOOperation | undefined>;

  // Stock Moves
  getAllStockMoves(): Promise<StockMove[]>;
  getStockMove(id: string): Promise<StockMove | undefined>;
  createStockMove(move: InsertStockMove): Promise<StockMove>;

  // Purchase Orders
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;

  // PO Line Items
  getPOLineItems(poId: string): Promise<POLineItem[]>;
  createPOLineItem(item: InsertPOLineItem): Promise<POLineItem>;

  // Sales Orders
  getAllSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  createSalesOrder(so: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, so: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined>;

  // SO Line Items
  getSOLineItems(soId: string): Promise<SOLineItem[]>;
  createSOLineItem(item: InsertSOLineItem): Promise<SOLineItem>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // Warehouses
  getAllWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: string): Promise<boolean>;

  // Locations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  getLocationsByWarehouse(warehouseId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;

  // Receipts
  getAllReceipts(): Promise<Receipt[]>;
  getReceipt(id: string): Promise<Receipt | undefined>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined>;
  deleteReceipt(id: string): Promise<boolean>;

  // Receipt Line Items
  getReceiptLineItems(receiptId: string): Promise<ReceiptLineItem[]>;
  createReceiptLineItem(item: InsertReceiptLineItem): Promise<ReceiptLineItem>;
  updateReceiptLineItem(id: string, item: Partial<InsertReceiptLineItem>): Promise<ReceiptLineItem | undefined>;
  deleteReceiptLineItem(id: string): Promise<boolean>;

  // Delivery Orders
  getAllDeliveryOrders(): Promise<DeliveryOrder[]>;
  getDeliveryOrder(id: string): Promise<DeliveryOrder | undefined>;
  createDeliveryOrder(order: InsertDeliveryOrder): Promise<DeliveryOrder>;
  updateDeliveryOrder(id: string, order: Partial<InsertDeliveryOrder>): Promise<DeliveryOrder | undefined>;
  deleteDeliveryOrder(id: string): Promise<boolean>;

  // Delivery Line Items
  getDeliveryLineItems(deliveryId: string): Promise<DeliveryLineItem[]>;
  createDeliveryLineItem(item: InsertDeliveryLineItem): Promise<DeliveryLineItem>;
  updateDeliveryLineItem(id: string, item: Partial<InsertDeliveryLineItem>): Promise<DeliveryLineItem | undefined>;
  deleteDeliveryLineItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private manufacturingOrders: Map<string, ManufacturingOrder>;
  private moComponents: Map<string, MOComponent>;
  private moOperations: Map<string, MOOperation>;
  private stockMoves: Map<string, StockMove>;
  private purchaseOrders: Map<string, PurchaseOrder>;
  private poLineItems: Map<string, POLineItem>;
  private salesOrders: Map<string, SalesOrder>;
  private soLineItems: Map<string, SOLineItem>;
  private contacts: Map<string, Contact>;
  private companySettings: CompanySettings | undefined;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.manufacturingOrders = new Map();
    this.moComponents = new Map();
    this.moOperations = new Map();
    this.stockMoves = new Map();
    this.purchaseOrders = new Map();
    this.poLineItems = new Map();
    this.salesOrders = new Map();
    this.soLineItems = new Map();
    this.contacts = new Map();
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample admin user
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    const adminUser: User = {
      id: randomUUID(),
      loginId: "admin",
      password: hashedPassword,
      email: "admin@stockmaster.com",
      role: "Inventory Manager",
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample warehouse staff user
    const staffPassword = await bcrypt.hash("Staff123!", 10);
    const staffUser: User = {
      id: randomUUID(),
      loginId: "staff",
      password: staffPassword,
      email: "staff@stockmaster.com",
      role: "Warehouse Staff",
    };
    this.users.set(staffUser.id, staffUser);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByLoginId(loginId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.loginId === loginId
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | undefined> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }

  async setResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.resetToken = token;
      user.resetTokenExpiry = expiresAt;
      this.users.set(userId, user);
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const now = new Date();
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > now
    );
  }

  async clearResetToken(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      this.users.set(userId, user);
    }
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find((p) => p.sku === sku);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(
    id: string,
    product: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Manufacturing Orders
  async getAllManufacturingOrders(): Promise<ManufacturingOrder[]> {
    return Array.from(this.manufacturingOrders.values());
  }

  async getManufacturingOrder(id: string): Promise<ManufacturingOrder | undefined> {
    return this.manufacturingOrders.get(id);
  }

  async createManufacturingOrder(mo: InsertManufacturingOrder): Promise<ManufacturingOrder> {
    const id = randomUUID();
    const newMO: ManufacturingOrder = { ...mo, id };
    this.manufacturingOrders.set(id, newMO);
    return newMO;
  }

  async updateManufacturingOrder(
    id: string,
    mo: Partial<InsertManufacturingOrder>
  ): Promise<ManufacturingOrder | undefined> {
    const existing = this.manufacturingOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...mo };
    this.manufacturingOrders.set(id, updated);
    return updated;
  }

  // MO Components
  async getMOComponents(moId: string): Promise<MOComponent[]> {
    return Array.from(this.moComponents.values()).filter(
      (c) => c.moId === moId
    );
  }

  async createMOComponent(component: InsertMOComponent): Promise<MOComponent> {
    const id = randomUUID();
    const newComponent: MOComponent = { ...component, id };
    this.moComponents.set(id, newComponent);
    return newComponent;
  }

  // MO Operations
  async getMOOperations(moId: string): Promise<MOOperation[]> {
    return Array.from(this.moOperations.values()).filter(
      (op) => op.moId === moId
    );
  }

  async createMOOperation(operation: InsertMOOperation): Promise<MOOperation> {
    const id = randomUUID();
    const newOperation: MOOperation = { ...operation, id };
    this.moOperations.set(id, newOperation);
    return newOperation;
  }

  async updateMOOperation(
    id: string,
    operation: Partial<InsertMOOperation>
  ): Promise<MOOperation | undefined> {
    const existing = this.moOperations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...operation };
    this.moOperations.set(id, updated);
    return updated;
  }

  // Stock Moves
  async getAllStockMoves(): Promise<StockMove[]> {
    return Array.from(this.stockMoves.values());
  }

  async getStockMove(id: string): Promise<StockMove | undefined> {
    return this.stockMoves.get(id);
  }

  async createStockMove(move: InsertStockMove): Promise<StockMove> {
    const id = randomUUID();
    const newMove: StockMove = { ...move, id };
    this.stockMoves.set(id, newMove);
    return newMove;
  }

  // Purchase Orders
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = randomUUID();
    const newPO: PurchaseOrder = { ...po, id };
    this.purchaseOrders.set(id, newPO);
    return newPO;
  }

  async updatePurchaseOrder(
    id: string,
    po: Partial<InsertPurchaseOrder>
  ): Promise<PurchaseOrder | undefined> {
    const existing = this.purchaseOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...po };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  // PO Line Items
  async getPOLineItems(poId: string): Promise<POLineItem[]> {
    return Array.from(this.poLineItems.values()).filter(
      (item) => item.poId === poId
    );
  }

  async createPOLineItem(item: InsertPOLineItem): Promise<POLineItem> {
    const id = randomUUID();
    const newItem: POLineItem = { ...item, id };
    this.poLineItems.set(id, newItem);
    return newItem;
  }

  // Sales Orders
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(so: InsertSalesOrder): Promise<SalesOrder> {
    const id = randomUUID();
    const newSO: SalesOrder = { ...so, id };
    this.salesOrders.set(id, newSO);
    return newSO;
  }

  async updateSalesOrder(
    id: string,
    so: Partial<InsertSalesOrder>
  ): Promise<SalesOrder | undefined> {
    const existing = this.salesOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...so };
    this.salesOrders.set(id, updated);
    return updated;
  }

  // SO Line Items
  async getSOLineItems(soId: string): Promise<SOLineItem[]> {
    return Array.from(this.soLineItems.values()).filter(
      (item) => item.soId === soId
    );
  }

  async createSOLineItem(item: InsertSOLineItem): Promise<SOLineItem> {
    const id = randomUUID();
    const newItem: SOLineItem = { ...item, id };
    this.soLineItems.set(id, newItem);
    return newItem;
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(
    id: string,
    contact: Partial<InsertContact>
  ): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    return this.companySettings;
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    if (this.companySettings) {
      this.companySettings = { ...this.companySettings, ...settings };
    } else {
      const id = randomUUID();
      this.companySettings = { ...settings, id };
    }
    return this.companySettings;
  }

  // Warehouses - Stub implementations
  async getAllWarehouses(): Promise<Warehouse[]> {
    return [];
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    return undefined;
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const id = randomUUID();
    return { ...warehouse, id };
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    return undefined;
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    return false;
  }

  // Locations - Stub implementations
  async getAllLocations(): Promise<Location[]> {
    return [];
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return undefined;
  }

  async getLocationsByWarehouse(warehouseId: string): Promise<Location[]> {
    return [];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    return { ...location, id };
  }

  async updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined> {
    return undefined;
  }

  async deleteLocation(id: string): Promise<boolean> {
    return false;
  }

  // Receipts - Stub implementations
  async getAllReceipts(): Promise<Receipt[]> {
    return [];
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    return undefined;
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const id = randomUUID();
    return { ...receipt, id, createdAt: new Date(), updatedAt: new Date() };
  }

  async updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    return undefined;
  }

  async deleteReceipt(id: string): Promise<boolean> {
    return false;
  }

  // Receipt Line Items - Stub implementations
  async getReceiptLineItems(receiptId: string): Promise<ReceiptLineItem[]> {
    return [];
  }

  async createReceiptLineItem(item: InsertReceiptLineItem): Promise<ReceiptLineItem> {
    const id = randomUUID();
    return { ...item, id };
  }

  async updateReceiptLineItem(id: string, item: Partial<InsertReceiptLineItem>): Promise<ReceiptLineItem | undefined> {
    return undefined;
  }

  async deleteReceiptLineItem(id: string): Promise<boolean> {
    return false;
  }

  // Delivery Orders - Stub implementations
  async getAllDeliveryOrders(): Promise<DeliveryOrder[]> {
    return [];
  }

  async getDeliveryOrder(id: string): Promise<DeliveryOrder | undefined> {
    return undefined;
  }

  async createDeliveryOrder(order: InsertDeliveryOrder): Promise<DeliveryOrder> {
    const id = randomUUID();
    return { ...order, id, createdAt: new Date(), updatedAt: new Date() };
  }

  async updateDeliveryOrder(id: string, order: Partial<InsertDeliveryOrder>): Promise<DeliveryOrder | undefined> {
    return undefined;
  }

  async deleteDeliveryOrder(id: string): Promise<boolean> {
    return false;
  }

  // Delivery Line Items - Stub implementations
  async getDeliveryLineItems(deliveryId: string): Promise<DeliveryLineItem[]> {
    return [];
  }

  async createDeliveryLineItem(item: InsertDeliveryLineItem): Promise<DeliveryLineItem> {
    const id = randomUUID();
    return { ...item, id };
  }

  async updateDeliveryLineItem(id: string, item: Partial<InsertDeliveryLineItem>): Promise<DeliveryLineItem | undefined> {
    return undefined;
  }

  async deleteDeliveryLineItem(id: string): Promise<boolean> {
    return false;
  }
}

// Use database storage if DATABASE_URL is set, otherwise use in-memory storage
let storageInstance: IStorage;

if (process.env.DATABASE_URL) {
  // Use database storage
  const { DbStorage } = require("./db-storage");
  storageInstance = new DbStorage();
} else {
  // Use in-memory storage
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
