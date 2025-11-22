import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
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
  receipts,
  receiptLineItems,
  deliveryOrders,
  deliveryLineItems,
} from "@shared/schema";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please create a .env file with DATABASE_URL.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    // Note: We'll insert with unique constraints, so duplicates will fail gracefully

    // 1. Seed Users (10 entries)
    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const userData = [
      { loginId: "admin", email: "admin@stockmaster.com", password: hashedPassword, role: "Inventory Manager" },
      { loginId: "manager1", email: "manager1@stockmaster.com", password: hashedPassword, role: "Inventory Manager" },
      { loginId: "manager2", email: "manager2@stockmaster.com", password: hashedPassword, role: "Inventory Manager" },
      { loginId: "staff1", email: "staff1@stockmaster.com", password: hashedPassword, role: "Warehouse Staff" },
      { loginId: "staff2", email: "staff2@stockmaster.com", password: hashedPassword, role: "Warehouse Staff" },
      { loginId: "staff3", email: "staff3@stockmaster.com", password: hashedPassword, role: "Warehouse Staff" },
      { loginId: "john.doe", email: "john.doe@stockmaster.com", password: hashedPassword, role: "Inventory Manager" },
      { loginId: "jane.smith", email: "jane.smith@stockmaster.com", password: hashedPassword, role: "Warehouse Staff" },
      { loginId: "bob.wilson", email: "bob.wilson@stockmaster.com", password: hashedPassword, role: "Inventory Manager" },
      { loginId: "alice.brown", email: "alice.brown@stockmaster.com", password: hashedPassword, role: "Warehouse Staff" },
    ];

    const insertedUsers = [];
    for (const user of userData) {
      try {
        const result = await db.insert(users).values(user).returning();
        insertedUsers.push(result[0]);
      } catch (error) {
        // User might already exist, try to fetch it
        const existing = await db.select().from(users).where(eq(users.loginId, user.loginId)).limit(1);
        if (existing[0]) insertedUsers.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // 2. Seed Contacts (10 entries - vendors and customers)
    console.log("Seeding contacts...");
    const contactData = [
      { name: "ABC Supplies Inc", phone: "+1-555-0101", email: "contact@abcsupplies.com", addressLine: "123 Main St", city: "New York", state: "NY", pincode: "10001", country: "USA", type: "Vendor" },
      { name: "XYZ Manufacturing", phone: "+1-555-0102", email: "sales@xyzmanufacturing.com", addressLine: "456 Oak Ave", city: "Los Angeles", state: "CA", pincode: "90001", country: "USA", type: "Vendor" },
      { name: "Global Materials Co", phone: "+1-555-0103", email: "info@globalmaterials.com", addressLine: "789 Pine Rd", city: "Chicago", state: "IL", pincode: "60601", country: "USA", type: "Vendor" },
      { name: "Premium Distributors", phone: "+1-555-0104", email: "orders@premiumdist.com", addressLine: "321 Elm St", city: "Houston", state: "TX", pincode: "77001", country: "USA", type: "Vendor" },
      { name: "Tech Components Ltd", phone: "+1-555-0105", email: "sales@techcomponents.com", addressLine: "654 Maple Dr", city: "Seattle", state: "WA", pincode: "98101", country: "USA", type: "Vendor" },
      { name: "Retail Solutions Inc", phone: "+1-555-0201", email: "orders@retailsolutions.com", addressLine: "987 Commerce Blvd", city: "Miami", state: "FL", pincode: "33101", country: "USA", type: "Customer" },
      { name: "Enterprise Buyers", phone: "+1-555-0202", email: "procurement@enterprisebuyers.com", addressLine: "147 Business Park", city: "Boston", state: "MA", pincode: "02101", country: "USA", type: "Customer" },
      { name: "Wholesale Partners", phone: "+1-555-0203", email: "contact@wholesalepartners.com", addressLine: "258 Trade Center", city: "Phoenix", state: "AZ", pincode: "85001", country: "USA", type: "Customer" },
      { name: "Retail Chain Corp", phone: "+1-555-0204", email: "orders@retailchain.com", addressLine: "369 Market St", city: "Denver", state: "CO", pincode: "80201", country: "USA", type: "Customer" },
      { name: "B2B Solutions", phone: "+1-555-0205", email: "sales@b2bsolutions.com", addressLine: "741 Corporate Ave", city: "Atlanta", state: "GA", pincode: "30301", country: "USA", type: "Both" },
    ];

    const insertedContacts = [];
    for (const contact of contactData) {
      try {
        const result = await db.insert(contacts).values(contact).returning();
        insertedContacts.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(contacts).where(eq(contacts.email, contact.email)).limit(1);
        if (existing[0]) insertedContacts.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedContacts.length} contacts`);

    // 3. Seed Warehouses (8 entries)
    console.log("Seeding warehouses...");
    const warehouseData = [
      { name: "Main Warehouse", shortcode: "MW", address: "100 Warehouse Blvd, New York, NY 10001" },
      { name: "East Coast Distribution", shortcode: "EC", address: "200 Distribution Way, Boston, MA 02101" },
      { name: "West Coast Hub", shortcode: "WC", address: "300 Hub Street, Los Angeles, CA 90001" },
      { name: "Central Storage", shortcode: "CS", address: "400 Storage Ave, Chicago, IL 60601" },
      { name: "South Regional", shortcode: "SR", address: "500 Regional Rd, Atlanta, GA 30301" },
      { name: "North Distribution", shortcode: "ND", address: "600 North St, Seattle, WA 98101" },
      { name: "Texas Facility", shortcode: "TF", address: "700 Texas Blvd, Houston, TX 77001" },
      { name: "Florida Depot", shortcode: "FD", address: "800 Depot Dr, Miami, FL 33101" },
    ];

    const insertedWarehouses = [];
    for (const warehouse of warehouseData) {
      try {
        const result = await db.insert(warehouses).values(warehouse).returning();
        insertedWarehouses.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(warehouses).where(eq(warehouses.shortcode, warehouse.shortcode)).limit(1);
        if (existing[0]) insertedWarehouses.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedWarehouses.length} warehouses`);

    // 4. Seed Products (10 entries)
    console.log("Seeding products...");
    const productData = [
      { name: "Steel Rods 10mm", sku: "STEEL-10MM", category: "Raw Materials", unitOfMeasure: "Pieces", description: "High-grade steel rods 10mm diameter", onHandQuantity: 500, reservedQuantity: 50, pricePerUnit: "25.50", location: "MW-A1", minimumQuantity: 100, preferredSupplier: insertedContacts[0]?.id },
      { name: "Aluminum Sheets", sku: "ALU-SHEET-001", category: "Raw Materials", unitOfMeasure: "Sheets", description: "Standard aluminum sheets 2x4ft", onHandQuantity: 200, reservedQuantity: 30, pricePerUnit: "45.00", location: "MW-A2", minimumQuantity: 50, preferredSupplier: insertedContacts[1]?.id },
      { name: "Wooden Planks", sku: "WOOD-PLANK-001", category: "Raw Materials", unitOfMeasure: "Pieces", description: "Oak wooden planks 2x4x8", onHandQuantity: 300, reservedQuantity: 40, pricePerUnit: "15.75", location: "MW-B1", minimumQuantity: 75, preferredSupplier: insertedContacts[2]?.id },
      { name: "Screws M6x20", sku: "SCREW-M6-20", category: "Hardware", unitOfMeasure: "Boxes", description: "Stainless steel screws M6x20mm, 100pc box", onHandQuantity: 150, reservedQuantity: 20, pricePerUnit: "8.50", location: "MW-C1", minimumQuantity: 30, preferredSupplier: insertedContacts[3]?.id },
      { name: "Paint White Gloss", sku: "PAINT-WHITE-GLOSS", category: "Finishing", unitOfMeasure: "Gallons", description: "Premium white gloss paint", onHandQuantity: 80, reservedQuantity: 10, pricePerUnit: "32.00", location: "MW-D1", minimumQuantity: 20, preferredSupplier: insertedContacts[4]?.id },
      { name: "Nuts M6", sku: "NUT-M6", category: "Hardware", unitOfMeasure: "Boxes", description: "Stainless steel nuts M6, 200pc box", onHandQuantity: 120, reservedQuantity: 15, pricePerUnit: "6.25", location: "MW-C2", minimumQuantity: 25, preferredSupplier: insertedContacts[3]?.id },
      { name: "Bolts M8x30", sku: "BOLT-M8-30", category: "Hardware", unitOfMeasure: "Boxes", description: "Stainless steel bolts M8x30mm, 50pc box", onHandQuantity: 100, reservedQuantity: 12, pricePerUnit: "12.00", location: "MW-C3", minimumQuantity: 20, preferredSupplier: insertedContacts[3]?.id },
      { name: "Sandpaper 120 Grit", sku: "SAND-120", category: "Finishing", unitOfMeasure: "Sheets", description: "Fine sandpaper 120 grit, 10 sheets pack", onHandQuantity: 200, reservedQuantity: 25, pricePerUnit: "5.50", location: "MW-D2", minimumQuantity: 40, preferredSupplier: insertedContacts[4]?.id },
      { name: "Varnish Clear", sku: "VARNISH-CLEAR", category: "Finishing", unitOfMeasure: "Quarts", description: "Clear wood varnish", onHandQuantity: 60, reservedQuantity: 8, pricePerUnit: "18.75", location: "MW-D3", minimumQuantity: 15, preferredSupplier: insertedContacts[4]?.id },
      { name: "Metal Brackets", sku: "BRACKET-METAL-001", category: "Hardware", unitOfMeasure: "Pieces", description: "Heavy-duty metal brackets", onHandQuantity: 250, reservedQuantity: 35, pricePerUnit: "9.25", location: "MW-C4", minimumQuantity: 50, preferredSupplier: insertedContacts[0]?.id },
    ];

    const insertedProducts = [];
    for (const product of productData) {
      try {
        const result = await db.insert(products).values(product).returning();
        insertedProducts.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(products).where(eq(products.sku, product.sku)).limit(1);
        if (existing[0]) insertedProducts.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // 5. Seed Company Settings (1 entry)
    console.log("Seeding company settings...");
    const companyData = {
      companyName: "StockMaster Inc",
      email: "info@stockmaster.com",
      phone: "+1-555-0000",
      addressLine: "1000 Corporate Plaza",
      buildingNo: "Suite 500",
      street: "Business Boulevard",
      city: "New York",
      state: "NY",
      pincode: "10001",
      country: "USA",
    };

    try {
      await db.insert(companySettings).values(companyData).onConflictDoNothing();
      console.log("✅ Inserted company settings");
    } catch (error) {
      console.log("ℹ️ Company settings already exist");
    }

    // 6. Seed Manufacturing Orders (8 entries)
    console.log("Seeding manufacturing orders...");
    const manufacturingOrderData = [
      { reference: "MO-2024-001", contact: insertedContacts[0]?.id || "", scheduleDate: new Date("2024-02-15"), status: "In Progress", quantity: 100, unitOfMeasure: "Pieces", productId: insertedProducts[0]?.id },
      { reference: "MO-2024-002", contact: insertedContacts[1]?.id || "", scheduleDate: new Date("2024-02-20"), status: "Ready", quantity: 50, unitOfMeasure: "Sheets", productId: insertedProducts[1]?.id },
      { reference: "MO-2024-003", contact: insertedContacts[2]?.id || "", scheduleDate: new Date("2024-02-25"), status: "Draft", quantity: 200, unitOfMeasure: "Pieces", productId: insertedProducts[2]?.id },
      { reference: "MO-2024-004", contact: insertedContacts[0]?.id || "", scheduleDate: new Date("2024-03-01"), status: "Done", quantity: 75, unitOfMeasure: "Pieces", productId: insertedProducts[0]?.id },
      { reference: "MO-2024-005", contact: insertedContacts[1]?.id || "", scheduleDate: new Date("2024-03-05"), status: "In Progress", quantity: 150, unitOfMeasure: "Sheets", productId: insertedProducts[1]?.id },
      { reference: "MO-2024-006", contact: insertedContacts[2]?.id || "", scheduleDate: new Date("2024-03-10"), status: "Ready", quantity: 300, unitOfMeasure: "Pieces", productId: insertedProducts[2]?.id },
      { reference: "MO-2024-007", contact: insertedContacts[0]?.id || "", scheduleDate: new Date("2024-03-15"), status: "Draft", quantity: 120, unitOfMeasure: "Pieces", productId: insertedProducts[0]?.id },
      { reference: "MO-2024-008", contact: insertedContacts[1]?.id || "", scheduleDate: new Date("2024-03-20"), status: "In Progress", quantity: 80, unitOfMeasure: "Sheets", productId: insertedProducts[1]?.id },
    ];

    const insertedMOs = [];
    for (const mo of manufacturingOrderData) {
      try {
        const result = await db.insert(manufacturingOrders).values(mo).returning();
        insertedMOs.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(manufacturingOrders).where(eq(manufacturingOrders.reference, mo.reference)).limit(1);
        if (existing[0]) insertedMOs.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedMOs.length} manufacturing orders`);

    // 7. Seed MO Components (for each MO)
    console.log("Seeding MO components...");
    let moComponentCount = 0;
    for (const mo of insertedMOs) {
      const components = [
        { moId: mo.id, componentName: "Base Material", requiredQuantity: 10, availableQuantity: 15, unitOfMeasure: "Pieces" },
        { moId: mo.id, componentName: "Fasteners", requiredQuantity: 50, availableQuantity: 100, unitOfMeasure: "Pieces" },
        { moId: mo.id, componentName: "Finishing Material", requiredQuantity: 5, availableQuantity: 8, unitOfMeasure: "Units" },
      ];
      for (const component of components) {
        try {
          await db.insert(moComponents).values(component);
          moComponentCount++;
        } catch (error) {
          // Component might already exist
        }
      }
    }
    console.log(`✅ Inserted ${moComponentCount} MO components`);

    // 8. Seed MO Operations (for each MO)
    console.log("Seeding MO operations...");
    let moOperationCount = 0;
    for (const mo of insertedMOs) {
      const operations = [
        { moId: mo.id, name: "Material Preparation", status: "Done", sequence: 1 },
        { moId: mo.id, name: "Cutting", status: mo.status === "Done" ? "Done" : "In Progress", sequence: 2 },
        { moId: mo.id, name: "Assembly", status: mo.status === "Draft" ? "Pending" : "In Progress", sequence: 3 },
        { moId: mo.id, name: "Finishing", status: mo.status === "Draft" ? "Pending" : "Pending", sequence: 4 },
        { moId: mo.id, name: "Quality Inspection", status: "Pending", sequence: 5 },
      ];
      for (const operation of operations) {
        try {
          await db.insert(moOperations).values(operation);
          moOperationCount++;
        } catch (error) {
          // Operation might already exist
        }
      }
    }
    console.log(`✅ Inserted ${moOperationCount} MO operations`);

    // 9. Seed Stock Moves (10 entries)
    console.log("Seeding stock moves...");
    const stockMoveData = [
      { date: new Date("2024-01-15"), reference: "SM-2024-001", fromLocation: "MW-A1", toLocation: "EC-A1", productId: insertedProducts[0]?.id || "", quantity: 50, status: "Done", type: "Internal" },
      { date: new Date("2024-01-20"), reference: "SM-2024-002", fromLocation: "External", toLocation: "MW-A2", productId: insertedProducts[1]?.id || "", quantity: 100, status: "Done", type: "Receipt" },
      { date: new Date("2024-01-25"), reference: "SM-2024-003", fromLocation: "MW-B1", toLocation: "External", productId: insertedProducts[2]?.id || "", quantity: 75, status: "Done", type: "Delivery" },
      { date: new Date("2024-02-01"), reference: "SM-2024-004", fromLocation: "MW-C1", toLocation: "WC-C1", productId: insertedProducts[3]?.id || "", quantity: 30, status: "Done", type: "Internal" },
      { date: new Date("2024-02-05"), reference: "SM-2024-005", fromLocation: "MW-D1", toLocation: "MW-D1", productId: insertedProducts[4]?.id || "", quantity: -5, status: "Done", type: "Adjustment" },
      { date: new Date("2024-02-10"), reference: "SM-2024-006", fromLocation: "External", toLocation: "MW-C2", productId: insertedProducts[5]?.id || "", quantity: 50, status: "Ready", type: "Receipt" },
      { date: new Date("2024-02-15"), reference: "SM-2024-007", fromLocation: "MW-C3", toLocation: "External", productId: insertedProducts[6]?.id || "", quantity: 25, status: "Waiting", type: "Delivery" },
      { date: new Date("2024-02-20"), reference: "SM-2024-008", fromLocation: "MW-A1", toLocation: "CS-A1", productId: insertedProducts[0]?.id || "", quantity: 40, status: "Done", type: "Internal" },
      { date: new Date("2024-02-25"), reference: "SM-2024-009", fromLocation: "MW-D2", toLocation: "MW-D2", productId: insertedProducts[7]?.id || "", quantity: -10, status: "Done", type: "Adjustment" },
      { date: new Date("2024-03-01"), reference: "SM-2024-010", fromLocation: "External", toLocation: "MW-D3", productId: insertedProducts[8]?.id || "", quantity: 20, status: "Ready", type: "Receipt" },
    ];

    const insertedStockMoves = [];
    for (const move of stockMoveData) {
      try {
        const result = await db.insert(stockMoves).values(move).returning();
        insertedStockMoves.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(stockMoves).where(eq(stockMoves.reference, move.reference)).limit(1);
        if (existing[0]) insertedStockMoves.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedStockMoves.length} stock moves`);

    // 10. Seed Purchase Orders (8 entries)
    console.log("Seeding purchase orders...");
    const purchaseOrderData = [
      { reference: "PO-2024-001", vendorId: insertedContacts[0]?.id || "", orderDate: new Date("2024-01-10"), status: "Received", total: "2550.00" },
      { reference: "PO-2024-002", vendorId: insertedContacts[1]?.id || "", orderDate: new Date("2024-01-15"), status: "Received", total: "4500.00" },
      { reference: "PO-2024-003", vendorId: insertedContacts[2]?.id || "", orderDate: new Date("2024-01-20"), status: "Confirmed", total: "3150.00" },
      { reference: "PO-2024-004", vendorId: insertedContacts[3]?.id || "", orderDate: new Date("2024-01-25"), status: "Draft", total: "1275.00" },
      { reference: "PO-2024-005", vendorId: insertedContacts[4]?.id || "", orderDate: new Date("2024-02-01"), status: "Received", total: "2560.00" },
      { reference: "PO-2024-006", vendorId: insertedContacts[0]?.id || "", orderDate: new Date("2024-02-05"), status: "Confirmed", total: "1850.00" },
      { reference: "PO-2024-007", vendorId: insertedContacts[1]?.id || "", orderDate: new Date("2024-02-10"), status: "Draft", total: "3600.00" },
      { reference: "PO-2024-008", vendorId: insertedContacts[2]?.id || "", orderDate: new Date("2024-02-15"), status: "Received", total: "4725.00" },
    ];

    const insertedPOs = [];
    for (const po of purchaseOrderData) {
      try {
        const result = await db.insert(purchaseOrders).values(po).returning();
        insertedPOs.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(purchaseOrders).where(eq(purchaseOrders.reference, po.reference)).limit(1);
        if (existing[0]) insertedPOs.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedPOs.length} purchase orders`);

    // 11. Seed PO Line Items (2-3 items per PO)
    console.log("Seeding PO line items...");
    let poLineItemCount = 0;
    const poProducts = [insertedProducts[0], insertedProducts[1], insertedProducts[2], insertedProducts[3], insertedProducts[4]];
    for (let i = 0; i < insertedPOs.length; i++) {
      const po = insertedPOs[i];
      const product = poProducts[i % poProducts.length];
      if (product) {
        const lineItems = [
          { poId: po.id, productId: product.id, quantity: 10, unitPrice: product.pricePerUnit || "25.50", subtotal: String(parseFloat(product.pricePerUnit || "25.50") * 10) },
          { poId: po.id, productId: poProducts[(i + 1) % poProducts.length]?.id || product.id, quantity: 5, unitPrice: poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00", subtotal: String(parseFloat(poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00") * 5) },
        ];
        for (const item of lineItems) {
          try {
            await db.insert(poLineItems).values(item);
            poLineItemCount++;
          } catch (error) {
            // Item might already exist
          }
        }
      }
    }
    console.log(`✅ Inserted ${poLineItemCount} PO line items`);

    // 12. Seed Sales Orders (8 entries)
    console.log("Seeding sales orders...");
    const salesOrderData = [
      { reference: "SO-2024-001", customerId: insertedContacts[5]?.id || "", orderDate: new Date("2024-01-12"), status: "Delivered", total: "510.00" },
      { reference: "SO-2024-002", customerId: insertedContacts[6]?.id || "", orderDate: new Date("2024-01-18"), status: "Delivered", total: "900.00" },
      { reference: "SO-2024-003", customerId: insertedContacts[7]?.id || "", orderDate: new Date("2024-01-22"), status: "Confirmed", total: "630.00" },
      { reference: "SO-2024-004", customerId: insertedContacts[8]?.id || "", orderDate: new Date("2024-01-28"), status: "Draft", total: "255.00" },
      { reference: "SO-2024-005", customerId: insertedContacts[9]?.id || "", orderDate: new Date("2024-02-03"), status: "Delivered", total: "512.00" },
      { reference: "SO-2024-006", customerId: insertedContacts[5]?.id || "", orderDate: new Date("2024-02-08"), status: "Confirmed", total: "370.00" },
      { reference: "SO-2024-007", customerId: insertedContacts[6]?.id || "", orderDate: new Date("2024-02-12"), status: "Draft", total: "720.00" },
      { reference: "SO-2024-008", customerId: insertedContacts[7]?.id || "", orderDate: new Date("2024-02-18"), status: "Delivered", total: "945.00" },
    ];

    const insertedSOs = [];
    for (const so of salesOrderData) {
      try {
        const result = await db.insert(salesOrders).values(so).returning();
        insertedSOs.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(salesOrders).where(eq(salesOrders.reference, so.reference)).limit(1);
        if (existing[0]) insertedSOs.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedSOs.length} sales orders`);

    // 13. Seed SO Line Items (2-3 items per SO)
    console.log("Seeding SO line items...");
    let soLineItemCount = 0;
    for (let i = 0; i < insertedSOs.length; i++) {
      const so = insertedSOs[i];
      const product = poProducts[i % poProducts.length];
      if (product) {
        const lineItems = [
          { soId: so.id, productId: product.id, quantity: 2, unitPrice: product.pricePerUnit || "25.50", subtotal: String(parseFloat(product.pricePerUnit || "25.50") * 2) },
          { soId: so.id, productId: poProducts[(i + 1) % poProducts.length]?.id || product.id, quantity: 1, unitPrice: poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00", subtotal: String(parseFloat(poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00") * 1) },
        ];
        for (const item of lineItems) {
          try {
            await db.insert(soLineItems).values(item);
            soLineItemCount++;
          } catch (error) {
            // Item might already exist
          }
        }
      }
    }
    console.log(`✅ Inserted ${soLineItemCount} SO line items`);

    // 14. Seed Receipts (8 entries)
    console.log("Seeding receipts...");
    const receiptData = [
      { receiptNumber: "REC-2024-001", supplierId: insertedContacts[0]?.id || "", warehouseId: insertedWarehouses[0]?.id || "", scheduledDate: new Date("2024-01-10"), receiptDate: new Date("2024-01-10"), status: "Done" },
      { receiptNumber: "REC-2024-002", supplierId: insertedContacts[1]?.id || "", warehouseId: insertedWarehouses[1]?.id || "", scheduledDate: new Date("2024-01-15"), receiptDate: new Date("2024-01-15"), status: "Done" },
      { receiptNumber: "REC-2024-003", supplierId: insertedContacts[2]?.id || "", warehouseId: insertedWarehouses[2]?.id || "", scheduledDate: new Date("2024-01-20"), receiptDate: new Date("2024-01-20"), status: "Done" },
      { receiptNumber: "REC-2024-004", supplierId: insertedContacts[3]?.id || "", warehouseId: insertedWarehouses[3]?.id || "", scheduledDate: new Date("2024-01-25"), receiptDate: new Date("2024-01-25"), status: "Ready" },
      { receiptNumber: "REC-2024-005", supplierId: insertedContacts[4]?.id || "", warehouseId: insertedWarehouses[4]?.id || "", scheduledDate: new Date("2024-02-01"), receiptDate: new Date("2024-02-01"), status: "Done" },
      { receiptNumber: "REC-2024-006", supplierId: insertedContacts[0]?.id || "", warehouseId: insertedWarehouses[5]?.id || "", scheduledDate: new Date("2024-02-05"), receiptDate: new Date("2024-02-05"), status: "Draft" },
      { receiptNumber: "REC-2024-007", supplierId: insertedContacts[1]?.id || "", warehouseId: insertedWarehouses[6]?.id || "", scheduledDate: new Date("2024-02-10"), receiptDate: new Date("2024-02-10"), status: "Ready" },
      { receiptNumber: "REC-2024-008", supplierId: insertedContacts[2]?.id || "", warehouseId: insertedWarehouses[7]?.id || "", scheduledDate: new Date("2024-02-15"), receiptDate: new Date("2024-02-15"), status: "Done" },
    ];

    const insertedReceipts = [];
    for (const receipt of receiptData) {
      try {
        const result = await db.insert(receipts).values(receipt).returning();
        insertedReceipts.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(receipts).where(eq(receipts.receiptNumber, receipt.receiptNumber)).limit(1);
        if (existing[0]) insertedReceipts.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedReceipts.length} receipts`);

    // 15. Seed Receipt Line Items (2-3 items per receipt)
    console.log("Seeding receipt line items...");
    let receiptLineItemCount = 0;
    for (let i = 0; i < insertedReceipts.length; i++) {
      const receipt = insertedReceipts[i];
      const product = poProducts[i % poProducts.length];
      if (product) {
        const lineItems = [
          { receiptId: receipt.id, productId: product.id, quantityReceived: 10, pricePerUnit: product.pricePerUnit || "25.50" },
          { receiptId: receipt.id, productId: poProducts[(i + 1) % poProducts.length]?.id || product.id, quantityReceived: 5, pricePerUnit: poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00" },
        ];
        for (const item of lineItems) {
          try {
            await db.insert(receiptLineItems).values(item);
            receiptLineItemCount++;
          } catch (error) {
            // Item might already exist
          }
        }
      }
    }
    console.log(`✅ Inserted ${receiptLineItemCount} receipt line items`);

    // 16. Seed Delivery Orders (8 entries)
    console.log("Seeding delivery orders...");
    const deliveryOrderData = [
      { deliveryNumber: "DEL-2024-001", customerId: insertedContacts[5]?.id || "", deliveryDate: new Date("2024-01-12"), status: "Validated" },
      { deliveryNumber: "DEL-2024-002", customerId: insertedContacts[6]?.id || "", deliveryDate: new Date("2024-01-18"), status: "Validated" },
      { deliveryNumber: "DEL-2024-003", customerId: insertedContacts[7]?.id || "", deliveryDate: new Date("2024-01-22"), status: "Packed" },
      { deliveryNumber: "DEL-2024-004", customerId: insertedContacts[8]?.id || "", deliveryDate: new Date("2024-01-28"), status: "Picked" },
      { deliveryNumber: "DEL-2024-005", customerId: insertedContacts[9]?.id || "", deliveryDate: new Date("2024-02-03"), status: "Validated" },
      { deliveryNumber: "DEL-2024-006", customerId: insertedContacts[5]?.id || "", deliveryDate: new Date("2024-02-08"), status: "Packed" },
      { deliveryNumber: "DEL-2024-007", customerId: insertedContacts[6]?.id || "", deliveryDate: new Date("2024-02-12"), status: "Picked" },
      { deliveryNumber: "DEL-2024-008", customerId: insertedContacts[7]?.id || "", deliveryDate: new Date("2024-02-18"), status: "Validated" },
    ];

    const insertedDeliveries = [];
    for (const delivery of deliveryOrderData) {
      try {
        const result = await db.insert(deliveryOrders).values(delivery).returning();
        insertedDeliveries.push(result[0]);
      } catch (error) {
        const existing = await db.select().from(deliveryOrders).where(eq(deliveryOrders.deliveryNumber, delivery.deliveryNumber)).limit(1);
        if (existing[0]) insertedDeliveries.push(existing[0]);
      }
    }
    console.log(`✅ Inserted ${insertedDeliveries.length} delivery orders`);

    // 17. Seed Delivery Line Items (2-3 items per delivery)
    console.log("Seeding delivery line items...");
    let deliveryLineItemCount = 0;
    for (let i = 0; i < insertedDeliveries.length; i++) {
      const delivery = insertedDeliveries[i];
      const product = poProducts[i % poProducts.length];
      if (product) {
        const pickedQty = 2;
        const packedQty = delivery.status === "Validated" ? 2 : delivery.status === "Packed" ? 2 : 0;
        const lineItems = [
          { deliveryId: delivery.id, productId: product.id, quantityPicked: pickedQty, quantityPacked: packedQty, pricePerUnit: product.pricePerUnit || "25.50" },
          { deliveryId: delivery.id, productId: poProducts[(i + 1) % poProducts.length]?.id || product.id, quantityPicked: 1, quantityPacked: delivery.status === "Validated" ? 1 : 0, pricePerUnit: poProducts[(i + 1) % poProducts.length]?.pricePerUnit || "45.00" },
        ];
        for (const item of lineItems) {
          try {
            await db.insert(deliveryLineItems).values(item);
            deliveryLineItemCount++;
          } catch (error) {
            // Item might already exist
          }
        }
      }
    }
    console.log(`✅ Inserted ${deliveryLineItemCount} delivery line items`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${insertedUsers.length}`);
    console.log(`   - Contacts: ${insertedContacts.length}`);
    console.log(`   - Warehouses: ${insertedWarehouses.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Manufacturing Orders: ${insertedMOs.length}`);
    console.log(`   - MO Components: ${moComponentCount}`);
    console.log(`   - MO Operations: ${moOperationCount}`);
    console.log(`   - Stock Moves: ${insertedStockMoves.length}`);
    console.log(`   - Purchase Orders: ${insertedPOs.length}`);
    console.log(`   - PO Line Items: ${poLineItemCount}`);
    console.log(`   - Sales Orders: ${insertedSOs.length}`);
    console.log(`   - SO Line Items: ${soLineItemCount}`);
    console.log(`   - Receipts: ${insertedReceipts.length}`);
    console.log(`   - Receipt Line Items: ${receiptLineItemCount}`);
    console.log(`   - Delivery Orders: ${insertedDeliveries.length}`);
    console.log(`   - Delivery Line Items: ${deliveryLineItemCount}`);
    console.log("\n🔑 Default login credentials:");
    console.log("   Login ID: admin");
    console.log("   Password: Password123!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });

