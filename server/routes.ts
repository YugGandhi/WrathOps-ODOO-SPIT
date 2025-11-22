import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { loginId, password } = req.body;

      if (!loginId || !password) {
        return res.status(400).json({ error: "Login ID and password are required" });
      }

      const user = await storage.getUserByLoginId(loginId);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Remove confirmPassword from validation
      const { confirmPassword, ...signupData } = req.body;
      const result = insertUserSchema.safeParse(signupData);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      // Check if user already exists
      const existingByLoginId = await storage.getUserByLoginId(result.data.loginId);
      if (existingByLoginId) {
        return res.status(400).json({ error: "Login ID already exists" });
      }

      const existingByEmail = await storage.getUserByEmail(result.data.email);
      if (existingByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser(result.data);
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      // Check if SKU already exists
      const existing = await storage.getProductBySku(result.data.sku);
      if (existing) {
        return res.status(400).json({ error: "SKU already exists" });
      }

      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Manufacturing Orders endpoints
  app.get("/api/manufacturing-orders", async (req, res) => {
    try {
      const orders = await storage.getAllManufacturingOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get manufacturing orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/manufacturing-orders/:id", async (req, res) => {
    try {
      const order = await storage.getManufacturingOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Manufacturing order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get manufacturing order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-orders", async (req, res) => {
    try {
      const order = await storage.createManufacturingOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create manufacturing order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/manufacturing-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateManufacturingOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Manufacturing order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update manufacturing order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // MO Components endpoints
  app.get("/api/manufacturing-orders/:moId/components", async (req, res) => {
    try {
      const components = await storage.getMOComponents(req.params.moId);
      res.json(components);
    } catch (error) {
      console.error("Get MO components error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-orders/:moId/components", async (req, res) => {
    try {
      const component = await storage.createMOComponent({
        ...req.body,
        moId: req.params.moId,
      });
      res.status(201).json(component);
    } catch (error) {
      console.error("Create MO component error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // MO Operations endpoints
  app.get("/api/manufacturing-orders/:moId/operations", async (req, res) => {
    try {
      const operations = await storage.getMOOperations(req.params.moId);
      res.json(operations);
    } catch (error) {
      console.error("Get MO operations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/manufacturing-orders/:moId/operations", async (req, res) => {
    try {
      const operation = await storage.createMOOperation({
        ...req.body,
        moId: req.params.moId,
      });
      res.status(201).json(operation);
    } catch (error) {
      console.error("Create MO operation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/operations/:id", async (req, res) => {
    try {
      const operation = await storage.updateMOOperation(req.params.id, req.body);
      if (!operation) {
        return res.status(404).json({ error: "Operation not found" });
      }
      res.json(operation);
    } catch (error) {
      console.error("Update operation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stock Moves endpoints
  app.get("/api/stock-moves", async (req, res) => {
    try {
      const moves = await storage.getAllStockMoves();
      res.json(moves);
    } catch (error) {
      console.error("Get stock moves error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stock-moves/:id", async (req, res) => {
    try {
      const move = await storage.getStockMove(req.params.id);
      if (!move) {
        return res.status(404).json({ error: "Stock move not found" });
      }
      res.json(move);
    } catch (error) {
      console.error("Get stock move error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/stock-moves", async (req, res) => {
    try {
      const move = await storage.createStockMove(req.body);
      res.status(201).json(move);
    } catch (error) {
      console.error("Create stock move error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Purchase Orders endpoints
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getAllPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get purchase orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const order = await storage.createPurchaseOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.updatePurchaseOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PO Line Items endpoints
  app.get("/api/purchase-orders/:poId/line-items", async (req, res) => {
    try {
      const items = await storage.getPOLineItems(req.params.poId);
      res.json(items);
    } catch (error) {
      console.error("Get PO line items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/purchase-orders/:poId/line-items", async (req, res) => {
    try {
      const item = await storage.createPOLineItem({
        ...req.body,
        poId: req.params.poId,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Create PO line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sales Orders endpoints
  app.get("/api/sales-orders", async (req, res) => {
    try {
      const orders = await storage.getAllSalesOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get sales orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sales-orders/:id", async (req, res) => {
    try {
      const order = await storage.getSalesOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get sales order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sales-orders", async (req, res) => {
    try {
      const order = await storage.createSalesOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create sales order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/sales-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateSalesOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update sales order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SO Line Items endpoints
  app.get("/api/sales-orders/:soId/line-items", async (req, res) => {
    try {
      const items = await storage.getSOLineItems(req.params.soId);
      res.json(items);
    } catch (error) {
      console.error("Get SO line items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sales-orders/:soId/line-items", async (req, res) => {
    try {
      const item = await storage.createSOLineItem({
        ...req.body,
        soId: req.params.soId,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Create SO line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contacts endpoints
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Get contact error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = await storage.createContact(req.body);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Create contact error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Update contact error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContact(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete contact error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Company Settings endpoints
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Get company settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update company settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
