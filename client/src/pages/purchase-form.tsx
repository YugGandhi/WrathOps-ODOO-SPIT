import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReceiptLineItem {
  id: string;
  productId: string;
  productName: string;
  quantityReceived: number;
  pricePerUnit: number;
}

// Mock products for receipt with prices
const mockProducts = [
  { id: "1", name: "Oak Wood Plank", sku: "OWP-001", pricePerUnit: 12.50 },
  { id: "2", name: "Metal Brackets Set", sku: "MBS-045", pricePerUnit: 8.75 },
  { id: "3", name: "Paint - White Gloss", sku: "PNT-WG-5L", pricePerUnit: 45.00 },
  { id: "4", name: "Screws Box (1000 pcs)", sku: "SCR-1000", pricePerUnit: 15.99 },
  { id: "5", name: "Pine Wood Board", sku: "PWB-002", pricePerUnit: 9.25 },
  { id: "6", name: "Steel Rods", sku: "STR-001", pricePerUnit: 18.50 },
];

// Mock suppliers - will be managed in state
const initialSuppliers = [
  { id: "1", name: "Timber Supplies Inc.", email: "contact@timbersupplies.com", phone: "+1-555-0101", address: "123 Timber St" },
  { id: "2", name: "Hardware Wholesale Ltd.", email: "info@hardwarewholesale.com", phone: "+1-555-0102", address: "456 Hardware Ave" },
  { id: "3", name: "Paint & Coating Co.", email: "sales@paintcoating.com", phone: "+1-555-0103", address: "789 Paint Blvd" },
  { id: "4", name: "Metal Works Corp.", email: "contact@metalworks.com", phone: "+1-555-0104", address: "321 Metal Rd" },
];

// Mock warehouses with shortcodes
const mockWarehouses = [
  { id: "1", name: "Warehouse A", shortcode: "mw/za" },
  { id: "2", name: "Warehouse B", shortcode: "mw/zb" },
  { id: "3", name: "Warehouse C", shortcode: "mw/zc" },
  { id: "4", name: "Main Warehouse", shortcode: "mw/main" },
];

// Mock existing receipts to generate next receipt number
const existingReceipts = [
  "REC/2024/0001",
  "REC/2024/0002",
  "REC/2024/0003",
  "REC/2024/0004",
];

// Mock receipt orders for editing
const mockReceiptOrders = [
  {
    id: "1",
    receiptNumber: "REC/2024/0001",
    supplierId: "1",
    warehouseId: "1",
    scheduledDate: "2024-01-10",
    receiptDate: "2024-01-10",
    status: "Draft",
    lineItems: [
      { productId: "1", productName: "Oak Wood Plank", sku: "OWP-001", quantityReceived: 50, pricePerUnit: 12.50 },
      { productId: "5", productName: "Pine Wood Board", sku: "PWB-002", quantityReceived: 30, pricePerUnit: 9.25 },
    ],
  },
  {
    id: "2",
    receiptNumber: "REC/2024/0002",
    supplierId: "2",
    warehouseId: "2",
    scheduledDate: "2024-01-12",
    receiptDate: "2024-01-12",
    status: "Ready",
    lineItems: [
      { productId: "2", productName: "Metal Brackets Set", sku: "MBS-045", quantityReceived: 100, pricePerUnit: 8.75 },
      { productId: "4", productName: "Screws Box (1000 pcs)", sku: "SCR-1000", quantityReceived: 25, pricePerUnit: 15.99 },
    ],
  },
  {
    id: "3",
    receiptNumber: "REC/2024/0003",
    supplierId: "4",
    warehouseId: "1",
    scheduledDate: "2024-01-15",
    receiptDate: "2024-01-15",
    status: "Done",
    lineItems: [
      { productId: "6", productName: "Steel Rods", sku: "STR-001", quantityReceived: 50, pricePerUnit: 18.50 },
    ],
  },
];

// Function to generate next receipt number
const generateReceiptNumber = () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `REC/${currentYear}/`;
  
  // Find the highest number for this year
  const numbers = existingReceipts
    .filter(r => r.startsWith(yearPrefix))
    .map(r => parseInt(r.replace(yearPrefix, "")))
    .filter(n => !isNaN(n));
  
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${yearPrefix}${String(nextNumber).padStart(4, "0")}`;
};

export default function ReceiptForm() {
  const [match, params] = useRoute("/purchase/:id/edit");
  const isEdit = !!match;
  const receiptId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"Draft" | "Ready" | "Done">("Draft");
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    { id: "1", productId: "", productName: "", quantityReceived: 0, pricePerUnit: 0 }
  ]);

  const form = useForm({
    defaultValues: {
      receiptNumber: "",
      supplierId: "",
      warehouseId: "",
      scheduledDate: new Date().toISOString().split('T')[0],
      receiptDate: new Date().toISOString().split('T')[0],
    },
  });

  const supplierSchema = z.object({
    name: z.string().min(1, "Supplier name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
  });

  const newSupplierForm = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Load receipt data if editing
  useEffect(() => {
    if (isEdit && receiptId) {
      const receipt = mockReceiptOrders.find(r => r.id === receiptId);
      if (receipt) {
        form.reset({
          receiptNumber: receipt.receiptNumber,
          supplierId: receipt.supplierId,
          warehouseId: receipt.warehouseId,
          scheduledDate: receipt.scheduledDate,
          receiptDate: receipt.receiptDate,
        });
        setCurrentStatus(receipt.status as "Draft" | "Ready" | "Done");
        setLineItems(receipt.lineItems.map((item, index) => ({
          id: String(index + 1),
          productId: item.productId,
          productName: item.productName,
          quantityReceived: item.quantityReceived,
          pricePerUnit: item.pricePerUnit,
        })));
      }
    } else {
      // Auto-generate receipt number for new receipts
      const receiptNumber = generateReceiptNumber();
      form.setValue("receiptNumber", receiptNumber);
      setCurrentStatus("Draft"); // Default status for new receipts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, receiptId]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), productId: "", productName: "", quantityReceived: 0, pricePerUnit: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof ReceiptLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === "productId") {
          const product = mockProducts.find(p => p.id === value);
          return { 
            ...item, 
            [field]: value, 
            productName: product?.name || "",
            pricePerUnit: product?.pricePerUnit || 0
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => 
      sum + (item.quantityReceived * item.pricePerUnit), 0
    );
  };

  const handleAddNewSupplier = (data: any) => {
    const newSupplier = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    };
    
    setSuppliers([...suppliers, newSupplier]);
    form.setValue("supplierId", newSupplier.id);
    setShowNewSupplierDialog(false);
    newSupplierForm.reset();
    
    toast({
      title: "Supplier added",
      description: `${data.name} has been added successfully`,
    });
  };

  const updateStatus = async (newStatus: "Draft" | "Ready" | "Done") => {
    const formData = form.getValues();
    
    if (!formData.supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (!formData.warehouseId) {
      toast({
        title: "Validation Error",
        description: "Please select a warehouse",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === "Done") {
      if (lineItems.length === 0 || lineItems.some(item => !item.productId || item.quantityReceived <= 0)) {
        toast({
          title: "Validation Error",
          description: "Please add products with quantities received before marking as Done",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      if (newStatus === "Done") {
        // Simulate stock increase
        console.log("Marking receipt as Done - stock will increase:", lineItems);
        toast({
          title: "Receipt Marked as Done",
          description: "Stock has been increased automatically",
        });
      } else {
        toast({
          title: `Status updated to ${newStatus}`,
          description: `Receipt status has been updated`,
        });
      }
      
      setCurrentStatus(newStatus);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canValidate = () => {
    return lineItems.every(item => 
      item.productId && 
      item.quantityReceived > 0
    );
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Receipt data:", { ...data, lineItems, status: currentStatus });
      toast({
        title: isEdit ? "Receipt updated" : "Receipt created",
        description: isEdit 
          ? "Receipt has been updated successfully"
          : "New receipt has been created successfully",
      });
      setLocation("/purchase");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save receipt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/purchase")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Edit Receipt" : "Create Receipt"} (Incoming Goods)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit 
              ? "Update receipt information and status"
              : "Record items received from vendors - stock increases automatically when marked as Done"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Receipt Details</CardTitle>
                <CardDescription>
                  {isEdit ? "Update receipt information" : "Step 1: Create a new receipt and add supplier information"}
                </CardDescription>
              </div>
              {isEdit && (
                <Badge className={`${
                  currentStatus === "Draft" ? "bg-gray-100 text-gray-800" :
                  currentStatus === "Ready" ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  Status: {currentStatus}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Receipt Number *</Label>
                  <Input
                    id="receiptNumber"
                    data-testid="input-receipt-number"
                    value={form.watch("receiptNumber")}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Receipt number is auto-generated
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Select 
                    value={form.watch("supplierId")}
                    onValueChange={(value) => {
                      if (value === "new") {
                        setShowNewSupplierDialog(true);
                      } else {
                        form.setValue("supplierId", value);
                      }
                    }}
                  >
                    <SelectTrigger id="supplierId" data-testid="select-supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-blue-600 font-medium">
                        <Plus className="w-4 h-4 inline mr-2" />
                        New Supplier
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouseId">To (Warehouse/Location Shortcode) *</Label>
                  <Select 
                    value={form.watch("warehouseId")}
                    onValueChange={(value) => form.setValue("warehouseId", value)}
                  >
                    <SelectTrigger id="warehouseId" data-testid="select-warehouse">
                      <SelectValue placeholder="Select warehouse location" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockWarehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.shortcode} - {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Format: location shortcode (e.g., mw/za)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    data-testid="input-scheduled-date"
                    {...form.register("scheduledDate")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptDate">Receipt Date *</Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    data-testid="input-receipt-date"
                    {...form.register("receiptDate")}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Products Received</CardTitle>
                <CardDescription>
                  Step 2: Add products and Step 3: Input quantities received
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addLineItem}
                data-testid="button-add-line-item"
                disabled={isEdit && currentStatus === "Done"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No products added yet</p>
            ) : (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity Received</TableHead>
                        <TableHead className="text-right">Price per Unit</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                        <TableHead className="text-center w-10">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateLineItem(item.id, "productId", value)}
                            >
                              <SelectTrigger className="w-full" data-testid={`select-product-${index}`}>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantityReceived}
                              onChange={(e) => updateLineItem(item.id, "quantityReceived", parseInt(e.target.value) || 0)}
                              className="w-32 text-right"
                              placeholder="Qty received"
                              data-testid={`input-quantity-${index}`}
                              disabled={isEdit && currentStatus === "Done"}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.pricePerUnit}
                              onChange={(e) => updateLineItem(item.id, "pricePerUnit", parseFloat(e.target.value) || 0)}
                              className="w-32 text-right"
                              placeholder="Price"
                              data-testid={`input-price-${index}`}
                              disabled={isEdit && currentStatus === "Done"}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.quantityReceived * item.pricePerUnit).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeLineItem(item.id)}
                              data-testid={`button-remove-item-${index}`}
                              disabled={isEdit && currentStatus === "Done"}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Grand Total:</span>
                      <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {currentStatus === "Done" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="font-medium">Receipt Done</p>
                  <p className="text-sm text-green-600">
                    Stock has been increased automatically for all products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          {isEdit ? (
            <>
              {currentStatus === "Draft" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Ready")}
                  disabled={isLoading || !form.watch("supplierId") || !form.watch("warehouseId")}
                  data-testid="button-move-to-ready"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Updating..." : "Move to Ready"}
                </Button>
              )}
              {currentStatus === "Ready" && (
                <>
                  <Button
                    type="button"
                    onClick={() => updateStatus("Draft")}
                    disabled={isLoading}
                    data-testid="button-move-to-draft"
                    variant="outline"
                  >
                    Move to Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => updateStatus("Done")}
                    disabled={isLoading || lineItems.length === 0 || !canValidate()}
                    data-testid="button-move-to-done"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isLoading ? "Updating..." : "Mark as Done → Stock Increases"}
                  </Button>
                </>
              )}
              {currentStatus === "Done" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Ready")}
                  disabled={isLoading}
                  data-testid="button-move-to-ready"
                  variant="outline"
                >
                  Move to Ready
                </Button>
              )}
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                data-testid="button-save-receipt"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              {currentStatus === "Draft" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Ready")}
                  disabled={isLoading || lineItems.length === 0 || !form.watch("supplierId") || !form.watch("warehouseId")}
                  data-testid="button-move-to-ready"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Updating..." : "Step 2: Move to Ready"}
                </Button>
              )}
              {currentStatus === "Ready" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Done")}
                  disabled={isLoading || lineItems.length === 0 || !canValidate()}
                  data-testid="button-move-to-done"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isLoading ? "Updating..." : "Step 3: Mark as Done → Stock Increases"}
                </Button>
              )}
              {currentStatus === "Done" && (
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  data-testid="button-save-receipt"
                >
                  {isLoading ? "Saving..." : "Save Receipt"}
                </Button>
              )}
            </>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/purchase")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the required information to add a new supplier
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={newSupplierForm.handleSubmit(handleAddNewSupplier)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name *</Label>
              <Input
                id="supplier-name"
                {...newSupplierForm.register("name")}
                placeholder="Enter supplier name"
                className={newSupplierForm.formState.errors.name ? "border-destructive" : ""}
              />
              {newSupplierForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {newSupplierForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-email">Email *</Label>
              <Input
                id="supplier-email"
                type="email"
                {...newSupplierForm.register("email")}
                placeholder="supplier@example.com"
                className={newSupplierForm.formState.errors.email ? "border-destructive" : ""}
              />
              {newSupplierForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {newSupplierForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Phone *</Label>
              <Input
                id="supplier-phone"
                {...newSupplierForm.register("phone")}
                placeholder="+1-555-0000"
                className={newSupplierForm.formState.errors.phone ? "border-destructive" : ""}
              />
              {newSupplierForm.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {newSupplierForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-address">Address *</Label>
              <Input
                id="supplier-address"
                {...newSupplierForm.register("address")}
                placeholder="Enter supplier address"
                className={newSupplierForm.formState.errors.address ? "border-destructive" : ""}
              />
              {newSupplierForm.formState.errors.address && (
                <p className="text-xs text-destructive">
                  {newSupplierForm.formState.errors.address.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                data-testid="button-add-supplier"
              >
                Add Supplier
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewSupplierDialog(false);
                  newSupplierForm.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
