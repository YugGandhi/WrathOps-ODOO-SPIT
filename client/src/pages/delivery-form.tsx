import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeliveryLineItem {
  id: string;
  productId: string;
  productName: string;
  quantityPicked: number;
  quantityPacked: number;
  pricePerUnit: number;
}

// Mock products for delivery
const mockProducts = [
  { id: "1", name: "Oak Wood Plank", sku: "OWP-001", pricePerUnit: 12.50 },
  { id: "2", name: "Metal Brackets Set", sku: "MBS-045", pricePerUnit: 8.75 },
  { id: "3", name: "Paint - White Gloss", sku: "PNT-WG-5L", pricePerUnit: 45.00 },
  { id: "4", name: "Screws Box (1000 pcs)", sku: "SCR-1000", pricePerUnit: 15.99 },
  { id: "5", name: "Pine Wood Board", sku: "PWB-002", pricePerUnit: 9.25 },
  { id: "6", name: "Steel Rods", sku: "STR-001", pricePerUnit: 18.50 },
];

// Mock customers
const mockCustomers = [
  { id: "1", name: "ABC Corporation" },
  { id: "2", name: "XYZ Limited" },
  { id: "3", name: "Global Traders Inc." },
  { id: "4", name: "Tech Solutions Ltd." },
];

// Mock existing delivery orders to generate next delivery number
const existingDeliveries = [
  "DO/2024/0001",
  "DO/2024/0002",
  "DO/2024/0003",
  "DO/2024/0004",
];

// Mock delivery orders for editing
const mockDeliveryOrders = [
  {
    id: "1",
    deliveryNumber: "DO/2024/0001",
    customerId: "1",
    customer: "ABC Corporation",
    deliveryDate: "2024-01-12",
    status: "Picked",
    lineItems: [
      { productId: "1", productName: "Oak Wood Plank", sku: "OWP-001", quantityPicked: 50, quantityPacked: 0, pricePerUnit: 12.50 },
      { productId: "2", productName: "Metal Brackets Set", sku: "MBS-045", quantityPicked: 30, quantityPacked: 0, pricePerUnit: 8.75 },
    ],
  },
  {
    id: "2",
    deliveryNumber: "DO/2024/0002",
    customerId: "2",
    customer: "XYZ Limited",
    deliveryDate: "2024-01-14",
    status: "Packed",
    lineItems: [
      { productId: "3", productName: "Paint - White Gloss", sku: "PNT-WG-5L", quantityPicked: 20, quantityPacked: 20, pricePerUnit: 45.00 },
      { productId: "4", productName: "Screws Box (1000 pcs)", sku: "SCR-1000", quantityPicked: 15, quantityPacked: 15, pricePerUnit: 15.99 },
    ],
  },
  {
    id: "3",
    deliveryNumber: "DO/2024/0003",
    customerId: "3",
    customer: "Global Traders Inc.",
    deliveryDate: "2024-01-15",
    status: "Validated",
    lineItems: [
      { productId: "6", productName: "Steel Rods", sku: "STR-001", quantityPicked: 30, quantityPacked: 30, pricePerUnit: 18.50 },
    ],
  },
];

// Function to generate next delivery number
const generateDeliveryNumber = () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `DO/${currentYear}/`;
  
  const numbers = existingDeliveries
    .filter(d => d.startsWith(yearPrefix))
    .map(d => parseInt(d.replace(yearPrefix, "")))
    .filter(n => !isNaN(n));
  
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${yearPrefix}${String(nextNumber).padStart(4, "0")}`;
};

export default function DeliveryForm() {
  const [match, params] = useRoute("/delivery/:id/edit");
  const isEdit = !!match;
  const deliveryId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"Picked" | "Packed" | "Validated">("Picked");
  const [lineItems, setLineItems] = useState<DeliveryLineItem[]>([
    { id: "1", productId: "", productName: "", quantityPicked: 0, quantityPacked: 0, pricePerUnit: 0 }
  ]);

  const form = useForm({
    defaultValues: {
      deliveryNumber: "",
      customerId: "",
      deliveryDate: new Date().toISOString().split('T')[0],
    },
  });

  // Load delivery data if editing
  useEffect(() => {
    if (isEdit && deliveryId) {
      const delivery = mockDeliveryOrders.find(d => d.id === deliveryId);
      if (delivery) {
        form.reset({
          deliveryNumber: delivery.deliveryNumber,
          customerId: delivery.customerId,
          deliveryDate: delivery.deliveryDate,
        });
        setCurrentStatus(delivery.status as "Picked" | "Packed" | "Validated");
        setLineItems(delivery.lineItems.map((item, index) => ({
          id: String(index + 1),
          productId: item.productId,
          productName: item.productName,
          quantityPicked: item.quantityPicked,
          quantityPacked: item.quantityPacked,
          pricePerUnit: item.pricePerUnit,
        })));
      }
    } else {
      // Auto-generate delivery number for new orders
      const deliveryNumber = generateDeliveryNumber();
      form.setValue("deliveryNumber", deliveryNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, deliveryId]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), productId: "", productName: "", quantityPicked: 0, quantityPacked: 0, pricePerUnit: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof DeliveryLineItem, value: any) => {
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
        // When packing, ensure packed quantity doesn't exceed picked quantity
        if (field === "quantityPacked" && value > item.quantityPicked) {
          value = item.quantityPicked;
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => 
      sum + (item.quantityPacked * item.pricePerUnit), 0
    );
  };

  const canMoveToPacked = () => {
    return lineItems.every(item => 
      item.productId && 
      item.quantityPicked > 0
    );
  };

  const canMoveToValidated = () => {
    return lineItems.every(item => 
      item.productId && 
      item.quantityPicked > 0 && 
      item.quantityPacked > 0 && 
      item.quantityPacked <= item.quantityPicked
    );
  };

  const updateStatus = async (newStatus: "Picked" | "Packed" | "Validated") => {
    const formData = form.getValues();
    
    if (!formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === "Packed" && !canMoveToPacked()) {
      toast({
        title: "Validation Error",
        description: "Please ensure all items have quantities picked",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === "Validated" && !canMoveToValidated()) {
      toast({
        title: "Validation Error",
        description: "Please ensure all items are picked and packed",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (newStatus === "Validated") {
        // Simulate stock decrease
        console.log("Validating delivery - stock will decrease:", lineItems);
        toast({
          title: "Delivery Validated",
          description: "Stock has been decreased automatically",
        });
      } else {
        toast({
          title: `Status updated to ${newStatus}`,
          description: `Delivery order status has been updated`,
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Delivery data:", { ...data, lineItems, status: currentStatus });
      toast({
        title: isEdit ? "Delivery updated" : "Delivery created",
        description: isEdit 
          ? "Delivery order has been updated successfully"
          : "New delivery order has been created successfully",
      });
      setLocation("/delivery");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save delivery",
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
          onClick={() => setLocation("/delivery")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Delivery Order (Outgoing Goods)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record items shipped to customers - stock decreases automatically upon validation
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Delivery Details</CardTitle>
                <CardDescription>
                  {isEdit ? "Update delivery order information" : "Create a new delivery order and select customer"}
                </CardDescription>
              </div>
              {isEdit && (
                <Badge className={`${
                  currentStatus === "Picked" ? "bg-blue-100 text-blue-800" :
                  currentStatus === "Packed" ? "bg-yellow-100 text-yellow-800" :
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
                  <Label htmlFor="deliveryNumber">Delivery Number *</Label>
                  <Input
                    id="deliveryNumber"
                    data-testid="input-delivery-number"
                    value={form.watch("deliveryNumber")}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Delivery number is auto-generated
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer *</Label>
                  <Select 
                    value={form.watch("customerId")}
                    onValueChange={(value) => form.setValue("customerId", value)}
                  >
                    <SelectTrigger id="customerId" data-testid="select-customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    data-testid="input-delivery-date"
                    {...form.register("deliveryDate")}
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
                <CardTitle className="text-lg">Items to Deliver</CardTitle>
                <CardDescription>
                  Step 1: Pick items | Step 2: Pack items | Step 3: Validate → Stock decreases
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addLineItem}
                data-testid="button-add-line-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No items added yet</p>
            ) : (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity Picked</TableHead>
                        <TableHead className="text-right">Quantity Packed</TableHead>
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
                              min="0"
                              value={item.quantityPicked}
                              onChange={(e) => updateLineItem(item.id, "quantityPicked", parseInt(e.target.value) || 0)}
                              className="w-32 text-right"
                              placeholder="Picked"
                              data-testid={`input-picked-${index}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantityPicked}
                              value={item.quantityPacked}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                updateLineItem(item.id, "quantityPacked", Math.min(value, item.quantityPicked));
                              }}
                              className="w-32 text-right"
                              placeholder="Packed"
                              data-testid={`input-packed-${index}`}
                            />
                            {item.quantityPacked > item.quantityPicked && (
                              <p className="text-xs text-destructive mt-1">
                                Cannot exceed picked quantity
                              </p>
                            )}
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
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.quantityPacked * item.pricePerUnit).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeLineItem(item.id)}
                              data-testid={`button-remove-item-${index}`}
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

        {currentStatus === "Validated" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="font-medium">Delivery Validated</p>
                  <p className="text-sm text-green-600">
                    Stock has been decreased automatically for all products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          {isEdit ? (
            <>
              {currentStatus === "Picked" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Packed")}
                  disabled={isLoading || !canMoveToPacked()}
                  data-testid="button-move-to-packed"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {isLoading ? "Updating..." : "Move to Packed"}
                </Button>
              )}
              {currentStatus === "Packed" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Validated")}
                  disabled={isLoading || !canMoveToValidated()}
                  data-testid="button-validate-delivery"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isLoading ? "Validating..." : "Validate → Stock Decreases"}
                </Button>
              )}
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                data-testid="button-save-delivery"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              {currentStatus === "Picked" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Packed")}
                  disabled={isLoading || lineItems.length === 0 || !form.watch("customerId") || !canMoveToPacked()}
                  data-testid="button-move-to-packed"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {isLoading ? "Updating..." : "Step 2: Move to Packed"}
                </Button>
              )}
              {currentStatus === "Packed" && (
                <Button
                  type="button"
                  onClick={() => updateStatus("Validated")}
                  disabled={isLoading || !canMoveToValidated()}
                  data-testid="button-validate-delivery"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isLoading ? "Validating..." : "Step 3: Validate → Stock Decreases"}
                </Button>
              )}
              {currentStatus === "Validated" && (
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  data-testid="button-save-delivery"
                >
                  {isLoading ? "Saving..." : "Save Delivery Order"}
                </Button>
              )}
            </>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/delivery")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

