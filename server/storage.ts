import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  Product,
  InsertProduct,
  ManufacturingOrder,
  InsertManufacturingOrder,
  ManufacturingComponent,
  InsertManufacturingComponent,
  ManufacturingOperation,
  InsertManufacturingOperation,
  StockMove,
  InsertStockMove,
  PurchaseOrder,
  InsertPurchaseOrder,
  PurchaseOrderItem,
  InsertPurchaseOrderItem,
  SalesOrder,
  InsertSalesOrder,
  SalesOrderItem,
  InsertSalesOrderItem,
  Contact,
  InsertContact,
  CompanySettings,
  InsertCompanySettings,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByLoginId(loginId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Manufacturing Orders
  getManufacturingOrders(): Promise<ManufacturingOrder[]>;
  getManufacturingOrder(id: string): Promise<ManufacturingOrder | undefined>;
  createManufacturingOrder(order: InsertManufacturingOrder): Promise<ManufacturingOrder>;
  updateManufacturingOrder(id: string, order: Partial<InsertManufacturingOrder>): Promise<ManufacturingOrder | undefined>;
  deleteManufacturingOrder(id: string): Promise<boolean>;

  // Manufacturing Components
  getManufacturingComponents(orderId: string): Promise<ManufacturingComponent[]>;
  createManufacturingComponent(component: InsertManufacturingComponent): Promise<ManufacturingComponent>;

  // Manufacturing Operations
  getManufacturingOperations(orderId: string): Promise<ManufacturingOperation[]>;
  createManufacturingOperation(operation: InsertManufacturingOperation): Promise<ManufacturingOperation>;
  updateManufacturingOperation(id: string, operation: Partial<InsertManufacturingOperation>): Promise<ManufacturingOperation | undefined>;

  // Stock Moves
  getStockMoves(): Promise<StockMove[]>;
  getStockMove(id: string): Promise<StockMove | undefined>;
  createStockMove(move: InsertStockMove): Promise<StockMove>;
  updateStockMove(id: string, move: Partial<InsertStockMove>): Promise<StockMove | undefined>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;

  // Purchase Order Items
  getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  deletePurchaseOrderItem(id: string): Promise<boolean>;

  // Sales Orders
  getSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, order: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(id: string): Promise<boolean>;

  // Sales Order Items
  getSalesOrderItems(orderId: string): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;
  deleteSalesOrderItem(id: string): Promise<boolean>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  createOrUpdateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private manufacturingOrders: Map<string, ManufacturingOrder> = new Map();
  private manufacturingComponents: Map<string, ManufacturingComponent> = new Map();
  private manufacturingOperations: Map<string, ManufacturingOperation> = new Map();
  private stockMoves: Map<string, StockMove> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private purchaseOrderItems: Map<string, PurchaseOrderItem> = new Map();
  private salesOrders: Map<string, SalesOrder> = new Map();
  private salesOrderItems: Map<string, SalesOrderItem> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private companySettings: CompanySettings | undefined;

  constructor() {
    void this.seedData();
  }

  private async seedData() {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const defaultUser: User = {
      id: randomUUID(),
      loginId: "admin",
      password: hashedPassword,
      email: "admin@stockmaster.com",
    };
    this.users.set(defaultUser.id, defaultUser);

    const settings: CompanySettings = {
      id: randomUUID(),
      companyName: "StockMaster Inc",
      email: "info@stockmaster.com",
      phone: "+1 (555) 000-0000",
      addressLine: "Tech Park Avenue",
      buildingNo: "Building 5",
      street: "Tech Park Avenue",
      city: "San Francisco",
      state: "California",
      pincode: "94102",
      country: "United States",
    };
    this.companySettings = settings;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByLoginId(loginId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.loginId === loginId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Manufacturing Orders
  async getManufacturingOrders(): Promise<ManufacturingOrder[]> {
    return Array.from(this.manufacturingOrders.values());
  }

  async getManufacturingOrder(id: string): Promise<ManufacturingOrder | undefined> {
    return this.manufacturingOrders.get(id);
  }

  async createManufacturingOrder(insertOrder: InsertManufacturingOrder): Promise<ManufacturingOrder> {
    const id = randomUUID();
    const order: ManufacturingOrder = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.manufacturingOrders.set(id, order);
    return order;
  }

  async updateManufacturingOrder(id: string, updates: Partial<InsertManufacturingOrder>): Promise<ManufacturingOrder | undefined> {
    const order = this.manufacturingOrders.get(id);
    if (!order) return undefined;

    const updated = { ...order, ...updates };
    this.manufacturingOrders.set(id, updated);
    return updated;
  }

  async deleteManufacturingOrder(id: string): Promise<boolean> {
    return this.manufacturingOrders.delete(id);
  }

  // Manufacturing Components
  async getManufacturingComponents(orderId: string): Promise<ManufacturingComponent[]> {
    return Array.from(this.manufacturingComponents.values()).filter(
      (c) => c.manufacturingOrderId === orderId
    );
  }

  async createManufacturingComponent(insertComponent: InsertManufacturingComponent): Promise<ManufacturingComponent> {
    const id = randomUUID();
    const component: ManufacturingComponent = { ...insertComponent, id };
    this.manufacturingComponents.set(id, component);
    return component;
  }

  // Manufacturing Operations
  async getManufacturingOperations(orderId: string): Promise<ManufacturingOperation[]> {
    return Array.from(this.manufacturingOperations.values()).filter(
      (o) => o.manufacturingOrderId === orderId
    );
  }

  async createManufacturingOperation(insertOperation: InsertManufacturingOperation): Promise<ManufacturingOperation> {
    const id = randomUUID();
    const operation: ManufacturingOperation = { ...insertOperation, id };
    this.manufacturingOperations.set(id, operation);
    return operation;
  }

  async updateManufacturingOperation(id: string, updates: Partial<InsertManufacturingOperation>): Promise<ManufacturingOperation | undefined> {
    const operation = this.manufacturingOperations.get(id);
    if (!operation) return undefined;

    const updated = { ...operation, ...updates };
    this.manufacturingOperations.set(id, updated);
    return updated;
  }

  // Stock Moves
  async getStockMoves(): Promise<StockMove[]> {
    return Array.from(this.stockMoves.values());
  }

  async getStockMove(id: string): Promise<StockMove | undefined> {
    return this.stockMoves.get(id);
  }

  async createStockMove(insertMove: InsertStockMove): Promise<StockMove> {
    const id = randomUUID();
    const move: StockMove = {
      ...insertMove,
      id,
      createdAt: new Date(),
    };
    this.stockMoves.set(id, move);
    return move;
  }

  async updateStockMove(id: string, updates: Partial<InsertStockMove>): Promise<StockMove | undefined> {
    const move = this.stockMoves.get(id);
    if (!move) return undefined;

    const updated = { ...move, ...updates };
    this.stockMoves.set(id, updated);
    return updated;
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = randomUUID();
    const order: PurchaseOrder = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.purchaseOrders.set(id, order);
    return order;
  }

  async updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const order = this.purchaseOrders.get(id);
    if (!order) return undefined;

    const updated = { ...order, ...updates };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  // Purchase Order Items
  async getPurchaseOrderItems(orderId: string): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values()).filter(
      (item) => item.purchaseOrderId === orderId
    );
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = randomUUID();
    const item: PurchaseOrderItem = { ...insertItem, id };
    this.purchaseOrderItems.set(id, item);
    return item;
  }

  async deletePurchaseOrderItem(id: string): Promise<boolean> {
    return this.purchaseOrderItems.delete(id);
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const id = randomUUID();
    const order: SalesOrder = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.salesOrders.set(id, order);
    return order;
  }

  async updateSalesOrder(id: string, updates: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const order = this.salesOrders.get(id);
    if (!order) return undefined;

    const updated = { ...order, ...updates };
    this.salesOrders.set(id, updated);
    return updated;
  }

  async deleteSalesOrder(id: string): Promise<boolean> {
    return this.salesOrders.delete(id);
  }

  // Sales Order Items
  async getSalesOrderItems(orderId: string): Promise<SalesOrderItem[]> {
    return Array.from(this.salesOrderItems.values()).filter(
      (item) => item.salesOrderId === orderId
    );
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const id = randomUUID();
    const item: SalesOrderItem = { ...insertItem, id };
    this.salesOrderItems.set(id, item);
    return item;
  }

  async deleteSalesOrderItem(id: string): Promise<boolean> {
    return this.salesOrderItems.delete(id);
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;

    const updated = { ...contact, ...updates };
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

  async createOrUpdateCompanySettings(insertSettings: InsertCompanySettings): Promise<CompanySettings> {
    if (this.companySettings) {
      this.companySettings = { ...this.companySettings, ...insertSettings };
    } else {
      const id = randomUUID();
      this.companySettings = { ...insertSettings, id };
    }
    return this.companySettings;
  }
}

export const storage = new MemStorage();
