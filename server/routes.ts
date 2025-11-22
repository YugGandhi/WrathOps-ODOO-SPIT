import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  insertUserSchema,
  insertProductSchema,
  insertManufacturingOrderSchema,
  insertManufacturingComponentSchema,
  insertManufacturingOperationSchema,
  insertStockMoveSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertSalesOrderSchema,
  insertSalesOrderItemSchema,
  insertContactSchema,
  insertCompanySettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByLoginId(data.loginId);
      if (existingUser) {
        return res.status(400).json({ message: "Login ID already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      res.json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { loginId, password } = req.body;
      
      if (!loginId || !password) {
        return res.status(400).json({ message: "Login ID and password are required" });
      }

      const user = await storage.getUserByLoginId(loginId);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ userId: user.id, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Products Routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Manufacturing Orders Routes
  app.get("/api/manufacturing-orders", async (_req, res) => {
    try {
      const orders = await storage.getManufacturingOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/manufacturing-orders/:id", async (req, res) => {
    try {
      const order = await storage.getManufacturingOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Manufacturing order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-orders", async (req, res) => {
    try {
      const data = insertManufacturingOrderSchema.parse(req.body);
      const order = await storage.createManufacturingOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/manufacturing-orders/:id", async (req, res) => {
    try {
      const data = insertManufacturingOrderSchema.partial().parse(req.body);
      const order = await storage.updateManufacturingOrder(req.params.id, data);
      if (!order) {
        return res.status(404).json({ message: "Manufacturing order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Manufacturing Components Routes
  app.get("/api/manufacturing-orders/:id/components", async (req, res) => {
    try {
      const components = await storage.getManufacturingComponents(req.params.id);
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-components", async (req, res) => {
    try {
      const data = insertManufacturingComponentSchema.parse(req.body);
      const component = await storage.createManufacturingComponent(data);
      res.status(201).json(component);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Manufacturing Operations Routes
  app.get("/api/manufacturing-orders/:id/operations", async (req, res) => {
    try {
      const operations = await storage.getManufacturingOperations(req.params.id);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-operations", async (req, res) => {
    try {
      const data = insertManufacturingOperationSchema.parse(req.body);
      const operation = await storage.createManufacturingOperation(data);
      res.status(201).json(operation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/manufacturing-operations/:id", async (req, res) => {
    try {
      const data = insertManufacturingOperationSchema.partial().parse(req.body);
      const operation = await storage.updateManufacturingOperation(req.params.id, data);
      if (!operation) {
        return res.status(404).json({ message: "Operation not found" });
      }
      res.json(operation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stock Moves Routes
  app.get("/api/stock-moves", async (_req, res) => {
    try {
      const moves = await storage.getStockMoves();
      res.json(moves);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stock-moves/:id", async (req, res) => {
    try {
      const move = await storage.getStockMove(req.params.id);
      if (!move) {
        return res.status(404).json({ message: "Stock move not found" });
      }
      res.json(move);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/stock-moves", async (req, res) => {
    try {
      const data = insertStockMoveSchema.parse(req.body);
      const move = await storage.createStockMove(data);
      res.status(201).json(move);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/stock-moves/:id", async (req, res) => {
    try {
      const data = insertStockMoveSchema.partial().parse(req.body);
      const move = await storage.updateStockMove(req.params.id, data);
      if (!move) {
        return res.status(404).json({ message: "Stock move not found" });
      }
      res.json(move);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Purchase Orders Routes
  app.get("/api/purchase-orders", async (_req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const data = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/purchase-orders/:id", async (req, res) => {
    try {
      const data = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(req.params.id, data);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Purchase Order Items Routes
  app.get("/api/purchase-orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getPurchaseOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/purchase-order-items", async (req, res) => {
    try {
      const data = insertPurchaseOrderItemSchema.parse(req.body);
      const item = await storage.createPurchaseOrderItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sales Orders Routes
  app.get("/api/sales-orders", async (_req, res) => {
    try {
      const orders = await storage.getSalesOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sales-orders/:id", async (req, res) => {
    try {
      const order = await storage.getSalesOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sales-orders", async (req, res) => {
    try {
      const data = insertSalesOrderSchema.parse(req.body);
      const order = await storage.createSalesOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/sales-orders/:id", async (req, res) => {
    try {
      const data = insertSalesOrderSchema.partial().parse(req.body);
      const order = await storage.updateSalesOrder(req.params.id, data);
      if (!order) {
        return res.status(404).json({ message: "Sales order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sales-orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSalesOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Sales order not found" });
      }
      res.json({ message: "Sales order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sales Order Items Routes
  app.get("/api/sales-orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getSalesOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sales-order-items", async (req, res) => {
    try {
      const data = insertSalesOrderItemSchema.parse(req.body);
      const item = await storage.createSalesOrderItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contacts Routes
  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const data = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(req.params.id, data);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Company Settings Routes
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const data = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateCompanySettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
