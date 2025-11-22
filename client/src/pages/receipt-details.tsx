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
  Draft: "bg-gray-100 text-gray-800",
  Ready: "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

export default function ReceiptDetails() {
  const [match, params] = useRoute("/purchase/receipt/:id");
  const [, setLocation] = useLocation();

  const receiptId = params?.id;

  // Fetch receipt
  const { data: receipt, isLoading: receiptLoading } = useQuery({
    queryKey: ["receipt", receiptId],
    queryFn: async () => {
      if (!receiptId) return null;
      const response = await fetch(`/api/receipts/${receiptId}`);
      if (!response.ok) throw new Error("Failed to fetch receipt");
      return response.json();
    },
    enabled: !!receiptId,
  });

  // Fetch receipt line items
  const { data: lineItems = [] } = useQuery({
    queryKey: ["receipt-line-items", receiptId],
    queryFn: async () => {
      if (!receiptId) return [];
      const response = await fetch(`/api/receipts/${receiptId}/line-items`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!receiptId,
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

  // Fetch supplier
  const { data: supplier } = useQuery({
    queryKey: ["supplier", receipt?.supplierId],
    queryFn: async () => {
      if (!receipt?.supplierId) return null;
      const response = await fetch(`/api/contacts/${receipt.supplierId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!receipt?.supplierId,
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

  const calculateTotal = () => {
    if (!lineItems.length) return 0;
    return lineItems.reduce((sum: number, item: any) => 
      sum + (item.quantityReceived * parseFloat(item.pricePerUnit || 0)), 0
    );
  };

  const getWarehouseShortcode = (warehouseId: string) => {
    const warehouse = warehouses.find((w: any) => w.id === warehouseId);
    return warehouse?.shortcode || "N/A";
  };

  const getProductInfo = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product ? { name: product.name, sku: product.sku } : { name: "Unknown", sku: "N/A" };
  };

  if (receiptLoading) {
    return (
      <div className="p-6">
        <p>Loading receipt...</p>
      </div>
    );
  }

  if (!receipt) {

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receipt?.receiptNumber}</title>
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
    if (!receipt) return;

    const content = `
RECEIPT DETAILS
================

Receipt Number: ${receipt.receiptNumber}
Supplier: ${supplier?.name || "N/A"}
To (Location Shortcode): ${getWarehouseShortcode(receipt.warehouseId)}
Scheduled Date: ${receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : "N/A"}
Receipt Date: ${receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : "N/A"}
Status: ${receipt.status}

PRODUCTS RECEIVED
=================

${lineItems.map((item: any, index: number) => {
  const productInfo = getProductInfo(item.productId);
  const price = parseFloat(item.pricePerUnit || 0);
  const qty = item.quantityReceived || 0;
  return `
${index + 1}. ${productInfo.name} (${productInfo.sku})
   Quantity: ${qty}
   Price per Unit: $${price.toFixed(2)}
   Total: $${(qty * price).toFixed(2)}
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
    a.download = `Receipt_${receipt.receiptNumber.replace(/\//g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!receipt) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/purchase")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Receipt Not Found</h1>
            <p className="text-sm text-muted-foreground mt-1">
              The receipt you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/purchase")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">
              Receipt Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View receipt information and received items
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

      <div id="receipt-content" className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Receipt Information</CardTitle>
              <Badge className={statusColors[receipt.status] || "bg-gray-100 text-gray-800"}>
                {receipt.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Receipt Number</p>
                <p className="font-medium">{receipt.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{supplier?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To (Location Shortcode)</p>
                <p className="font-medium">{getWarehouseShortcode(receipt.warehouseId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receipt Date</p>
                <p className="font-medium">
                  {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[receipt.status] || "bg-gray-100 text-gray-800"}>
                  {receipt.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="font-medium">
                  {lineItems.reduce((sum: number, item: any) => sum + (item.quantityReceived || 0), 0)} units
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Products Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity Received</TableHead>
                    <TableHead className="text-right">Price per Unit</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No line items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item: any, index: number) => {
                      const productInfo = getProductInfo(item.productId);
                      const price = parseFloat(item.pricePerUnit || 0);
                      const qty = item.quantityReceived || 0;
                      return (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">{productInfo.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {productInfo.sku}
                          </TableCell>
                          <TableCell className="text-right">
                            {qty}
                          </TableCell>
                          <TableCell className="text-right">
                            ${price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(qty * price).toFixed(2)}
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
                  Stock levels have been automatically increased for all products listed above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}}