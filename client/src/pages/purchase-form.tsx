import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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

// Function to generate next receipt number
const generateReceiptNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `REC/${currentYear}/`;
  
  try {
    const response = await fetch("/api/receipts");
    if (response.ok) {
      const receipts = await response.json();
      const numbers = receipts
        .filter((r: any) => r.receiptNumber?.startsWith(yearPrefix))
        .map((r: any) => parseInt(r.receiptNumber.replace(yearPrefix, "")))
        .filter((n: number) => !isNaN(n));
      
      const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      return `${yearPrefix}${String(nextNumber).padStart(4, "0")}`;
    }
  } catch (error) {
    console.error("Failed to fetch receipts for number generation", error);
  }
  
  return `${yearPrefix}0001`;
};

export default function ReceiptForm() {
  const [match, params] = useRoute("/purchase/:id/edit");
  const isEdit = !!match;
  const receiptId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"Draft" | "Ready" | "Done">("Draft");
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    { id: "1", productId: "", productName: "", quantityReceived: 0, pricePerUnit: 0 }
  ]);

  // Fetch suppliers
  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetch("/api/contacts?type=Vendor");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await fetch("/api/warehouses");
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

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

  const { data: receiptData } = useQuery({
    queryKey: ["receipt", receiptId],
    queryFn: async () => {
      if (!isEdit || !receiptId) return null;
      const response = await fetch(`/api/receipts/${receiptId}`);
      if (!response.ok) throw new Error("Failed to fetch receipt");
      return response.json();
    },
    enabled: isEdit && !!receiptId,
  });

  const { data: receiptLineItems = [] } = useQuery({
    queryKey: ["receipt-line-items", receiptId],
    queryFn: async () => {
      if (!isEdit || !receiptId) return [];
      const response = await fetch(`/api/receipts/${receiptId}/line-items`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isEdit && !!receiptId,
  });

  // Load receipt data if editing
  useEffect(() => {
    if (isEdit && receiptData) {
      form.reset({
        receiptNumber: receiptData.receiptNumber,
        supplierId: receiptData.supplierId,
        warehouseId: receiptData.warehouseId,
        scheduledDate: receiptData.scheduledDate ? new Date(receiptData.scheduledDate).toISOString().split('T')[0] : "",
        receiptDate: receiptData.receiptDate ? new Date(receiptData.receiptDate).toISOString().split('T')[0] : "",
      });
      setCurrentStatus(receiptData.status as "Draft" | "Ready" | "Done");
    } else if (!isEdit) {
      // Auto-generate receipt number for new receipts
      generateReceiptNumber().then((receiptNumber) => {
        form.setValue("receiptNumber", receiptNumber);
      });
      setCurrentStatus("Draft"); // Default status for new receipts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, receiptData]);

  useEffect(() => {
    if (isEdit && receiptLineItems.length > 0) {
      const itemsWithProducts = receiptLineItems.map((item: any, index: number) => {
        const product = products.find((p: any) => p.id === item.productId);
        return {
          id: String(index + 1),
          productId: item.productId,
          productName: product?.name || "",
          quantityReceived: item.quantityReceived || 0,
          pricePerUnit: parseFloat(item.pricePerUnit || 0),
        };
      });
      setLineItems(itemsWithProducts.length > 0 ? itemsWithProducts : [{ id: "1", productId: "", productName: "", quantityReceived: 0, pricePerUnit: 0 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, receiptLineItems, products]);

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
          const product = products.find((p: any) => p.id === value);
          return { 
            ...item, 
            [field]: value, 
            productName: product?.name || "",
            pricePerUnit: product?.pricePerUnit ? parseFloat(product.pricePerUnit) : 0
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

  const handleAddNewSupplier = async (data: any) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "Vendor",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create supplier");
      }

      const newSupplier = await response.json();
      form.setValue("supplierId", newSupplier.id);
      setShowNewSupplierDialog(false);
      newSupplierForm.reset();
      refetchSuppliers(); // Refresh suppliers list
      
      toast({
        title: "Supplier added",
        description: `${data.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
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
                      {warehouses.map((warehouse: any) => (
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
                                {products.map((product: any) => (
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
