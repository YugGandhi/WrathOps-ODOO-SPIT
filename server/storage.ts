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
}

export const storage = new MemStorage();
