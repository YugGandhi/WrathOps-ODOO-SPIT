import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertWarehouseSchema, insertLocationSchema } from "@shared/schema";
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If the email exists, an OTP has been sent" });
      }

      // Generate and store OTP
      const { otp, token } = await storage.generateAndStoreOTP(user.id);

      // In production, send email with OTP
      // For now, we'll log it (in production, this should be sent via email)
      console.log(`Password reset OTP for ${email}: ${otp}`);
      console.log(`Reset token (after OTP verification): ${token}`);
      
      res.json({ 
        message: "If the email exists, an OTP has been sent",
        // In development, return OTP for testing. Remove in production!
        otp: process.env.NODE_ENV === "development" ? otp : undefined
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }

      const result = await storage.verifyOTP(email, otp);
      
      if (!result.valid) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      res.json({ 
        message: "OTP verified successfully",
        token: result.token // Token to use for password reset
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          error: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character" 
        });
      }

      // Try to get user by token from OTP flow first, then fallback to resetToken
      let user = await storage.getUserByResetTokenFromOTP(token);
      if (!user) {
        user = await storage.getUserByResetToken(token);
      }
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      await storage.updateUserPassword(user.id, newPassword);
      
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // In a session-based auth, we would destroy the session here
      // For token-based auth, the client just removes the token
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      console.log("📦 GET /api/products called");
      const products = await storage.getAllProducts();
      console.log(`📦 Returning ${products.length} products`);
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

  // Warehouses endpoints
  app.get("/api/warehouses", async (req, res) => {
    try {
      console.log("🏭 GET /api/warehouses called");
      const warehouses = await storage.getAllWarehouses();
      console.log(`🏭 Returning ${warehouses.length} warehouses`);
      res.json(warehouses);
    } catch (error) {
      console.error("Get warehouses error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.getWarehouse(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (error) {
      console.error("Get warehouse error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const result = insertWarehouseSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const warehouse = await storage.createWarehouse(result.data);
      res.status(201).json(warehouse);
    } catch (error) {
      console.error("Create warehouse error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/warehouses/:id", async (req, res) => {
    try {
      const warehouse = await storage.updateWarehouse(req.params.id, req.body);
      if (!warehouse) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (error) {
      console.error("Update warehouse error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/warehouses/:id", async (req, res) => {
    try {
      const success = await storage.deleteWarehouse(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete warehouse error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Locations endpoints
  console.log("📍 Registering /api/locations route");
  app.get("/api/locations", async (req, res) => {
    try {
      console.log("📍 GET /api/locations called");
      const warehouseId = req.query.warehouseId as string | undefined;
      console.log("📍 Warehouse ID filter:", warehouseId);
      const locations = warehouseId
        ? await storage.getLocationsByWarehouse(warehouseId)
        : await storage.getAllLocations();
      console.log("📍 Returning locations:", locations.length);
      res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Get location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const result = insertLocationSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      const location = await storage.createLocation(result.data);
      res.status(201).json(location);
    } catch (error) {
      console.error("Create location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.updateLocation(req.params.id, req.body);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Update location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const success = await storage.deleteLocation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete location error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Receipts endpoints
  app.get("/api/receipts", async (req, res) => {
    try {
      console.log("📋 GET /api/receipts called");
      const receipts = await storage.getAllReceipts();
      console.log(`📋 Returning ${receipts.length} receipts`);
      res.json(receipts);
    } catch (error) {
      console.error("Get receipts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/receipts/:id", async (req, res) => {
    try {
      const receipt = await storage.getReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: "Receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      console.error("Get receipt error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/receipts", async (req, res) => {
    try {
      const receipt = await storage.createReceipt(req.body);
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Create receipt error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/receipts/:id", async (req, res) => {
    try {
      const receipt = await storage.updateReceipt(req.params.id, req.body);
      if (!receipt) {
        return res.status(404).json({ error: "Receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      console.error("Update receipt error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/receipts/:id", async (req, res) => {
    try {
      const success = await storage.deleteReceipt(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Receipt not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete receipt error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Receipt Line Items endpoints
  app.get("/api/receipts/:receiptId/line-items", async (req, res) => {
    try {
      const items = await storage.getReceiptLineItems(req.params.receiptId);
      res.json(items);
    } catch (error) {
      console.error("Get receipt line items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/receipts/:receiptId/line-items", async (req, res) => {
    try {
      const item = await storage.createReceiptLineItem({
        ...req.body,
        receiptId: req.params.receiptId,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Create receipt line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/receipts/line-items/:id", async (req, res) => {
    try {
      const item = await storage.updateReceiptLineItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Line item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update receipt line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/receipts/line-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteReceiptLineItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Line item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete receipt line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delivery Orders endpoints
  app.get("/api/delivery-orders", async (req, res) => {
    try {
      console.log("🚚 GET /api/delivery-orders called");
      const orders = await storage.getAllDeliveryOrders();
      console.log(`🚚 Returning ${orders.length} delivery orders`);
      res.json(orders);
    } catch (error) {
      console.error("Get delivery orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/delivery-orders/:id", async (req, res) => {
    try {
      const order = await storage.getDeliveryOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get delivery order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/delivery-orders", async (req, res) => {
    try {
      const order = await storage.createDeliveryOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create delivery order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/delivery-orders/:id", async (req, res) => {
    try {
      const order = await storage.updateDeliveryOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Update delivery order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/delivery-orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteDeliveryOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Delivery order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete delivery order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delivery Line Items endpoints
  app.get("/api/delivery-orders/:deliveryId/line-items", async (req, res) => {
    try {
      const items = await storage.getDeliveryLineItems(req.params.deliveryId);
      res.json(items);
    } catch (error) {
      console.error("Get delivery line items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/delivery-orders/:deliveryId/line-items", async (req, res) => {
    try {
      const item = await storage.createDeliveryLineItem({
        ...req.body,
        deliveryId: req.params.deliveryId,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Create delivery line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/delivery-orders/line-items/:id", async (req, res) => {
    try {
      const item = await storage.updateDeliveryLineItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Line item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update delivery line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/delivery-orders/line-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteDeliveryLineItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Line item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete delivery line item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  console.log("✅ All API routes registered");
  return httpServer;
}
