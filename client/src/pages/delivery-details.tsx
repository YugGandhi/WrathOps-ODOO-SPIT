import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Printer, Download } from "lucide-react";

const statusColors: Record<string, string> = {
  Picked: "bg-blue-100 text-blue-800",
  Packed: "bg-yellow-100 text-yellow-800",
  Validated: "bg-green-100 text-green-800",
};

export default function DeliveryDetails() {
  const [match, params] = useRoute("/delivery/:id");
  const [, setLocation] = useLocation();

  const deliveryId = params?.id;

  // Fetch delivery order
  const { data: delivery, isLoading: deliveryLoading } = useQuery({
    queryKey: ["delivery-order", deliveryId],
    queryFn: async () => {
      if (!deliveryId) return null;
      const response = await fetch(`/api/delivery-orders/${deliveryId}`);
      if (!response.ok) throw new Error("Failed to fetch delivery order");
      return response.json();
    },
    enabled: !!deliveryId,
  });

  // Fetch delivery line items
  const { data: lineItems = [] } = useQuery({
    queryKey: ["delivery-line-items", deliveryId],
    queryFn: async () => {
      if (!deliveryId) return [];
      const response = await fetch(`/api/delivery-orders/${deliveryId}/line-items`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!deliveryId,
  });

  // Fetch customer
  const { data: customer } = useQuery({
    queryKey: ["customer", delivery?.customerId],
    queryFn: async () => {
      if (!delivery?.customerId) return null;
      const response = await fetch(`/api/contacts/${delivery.customerId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!delivery?.customerId,
  });

  // Fetch products for line items
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const getProductInfo = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product ? { name: product.name, sku: product.sku } : { name: "Unknown", sku: "N/A" };
  };

  const calculateTotal = () => {
    if (!lineItems.length) return 0;
    return lineItems.reduce((sum: number, item: any) => 
      sum + (item.quantityPacked * parseFloat(item.pricePerUnit || 0)), 0
    );
  };

  if (deliveryLoading) {
    return (
      <div className="p-6">
        <p>Loading delivery order...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/delivery")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Delivery Not Found</h1>
            <p className="text-sm text-muted-foreground mt-1">
              The delivery order you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const printContent = document.getElementById("delivery-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Delivery ${delivery.deliveryNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .text-right { text-align: right; }
            .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    if (!delivery) return;

    const content = `
DELIVERY ORDER DETAILS
======================

Delivery Number: ${delivery.deliveryNumber}
Customer: ${customer?.name || "N/A"}
Delivery Date: ${delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : "N/A"}
Status: ${delivery.status}

ITEMS DELIVERED
===============

${lineItems.map((item: any, index: number) => {
  const productInfo = getProductInfo(item.productId);
  const price = parseFloat(item.pricePerUnit || 0);
  const picked = item.quantityPicked || 0;
  const packed = item.quantityPacked || 0;
  return `
${index + 1}. ${productInfo.name} (${productInfo.sku})
   Quantity Picked: ${picked}
   Quantity Packed: ${packed}
   Price per Unit: $${price.toFixed(2)}
   Total: $${(packed * price).toFixed(2)}
`;
}).join('')}

GRAND TOTAL: $${calculateTotal().toFixed(2)}

---
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Delivery_${delivery.deliveryNumber.replace(/\//g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/delivery")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">
              Delivery Order Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View delivery order information and shipped items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div id="delivery-content" className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Delivery Information</CardTitle>
              <Badge className={statusColors[delivery.status] || "bg-gray-100 text-gray-800"}>
                {delivery.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Number</p>
                <p className="font-medium">{delivery.deliveryNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{customer?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Date</p>
                <p className="font-medium">
                  {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="font-medium">
                  {lineItems.reduce((sum: number, item: any) => sum + (item.quantityPacked || 0), 0)} units
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity Picked</TableHead>
                    <TableHead className="text-right">Quantity Packed</TableHead>
                    <TableHead className="text-right">Price per Unit</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No line items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item: any, index: number) => {
                      const productInfo = getProductInfo(item.productId);
                      const price = parseFloat(item.pricePerUnit || 0);
                      const picked = item.quantityPicked || 0;
                      const packed = item.quantityPacked || 0;
                      return (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">{productInfo.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {productInfo.sku}
                          </TableCell>
                          <TableCell className="text-right">
                            {picked}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {packed}
                          </TableCell>
                          <TableCell className="text-right">
                            ${price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(packed * price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Grand Total:</span>
                  <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-blue-900">Stock Updated</p>
                <p className="text-sm text-blue-700 mt-1">
                  Stock levels have been automatically decreased for all products listed above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

