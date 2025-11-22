import { useRoute, useLocation } from "wouter";
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

// Mock delivery data
const mockDeliveries = [
  {
    id: "1",
    deliveryNumber: "DO/2024/0001",
    customer: "ABC Corporation",
    deliveryDate: "2024-01-12",
    status: "Validated",
    lineItems: [
      { productName: "Oak Wood Plank", sku: "OWP-001", quantityPicked: 50, quantityPacked: 50, pricePerUnit: 12.50 },
      { productName: "Metal Brackets Set", sku: "MBS-045", quantityPicked: 30, quantityPacked: 30, pricePerUnit: 8.75 },
    ],
  },
  {
    id: "2",
    deliveryNumber: "DO/2024/0002",
    customer: "XYZ Limited",
    deliveryDate: "2024-01-14",
    status: "Validated",
    lineItems: [
      { productName: "Paint - White Gloss", sku: "PNT-WG-5L", quantityPicked: 20, quantityPacked: 20, pricePerUnit: 45.00 },
      { productName: "Screws Box (1000 pcs)", sku: "SCR-1000", quantityPicked: 15, quantityPacked: 15, pricePerUnit: 15.99 },
    ],
  },
  {
    id: "3",
    deliveryNumber: "DO/2024/0003",
    customer: "Global Traders Inc.",
    deliveryDate: "2024-01-15",
    status: "Validated",
    lineItems: [
      { productName: "Steel Rods", sku: "STR-001", quantityPicked: 30, quantityPacked: 30, pricePerUnit: 18.50 },
    ],
  },
];

export default function DeliveryDetails() {
  const [match, params] = useRoute("/delivery/:id");
  const [, setLocation] = useLocation();

  const deliveryId = params?.id;
  const delivery = deliveryId ? mockDeliveries.find(d => d.id === deliveryId) : null;

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

  const calculateTotal = () => {
    return delivery.lineItems.reduce((sum, item) => 
      sum + (item.quantityPacked * item.pricePerUnit), 0
    );
  };

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
Customer: ${delivery.customer}
Delivery Date: ${delivery.deliveryDate}
Status: ${delivery.status}

ITEMS DELIVERED
===============

${delivery.lineItems.map((item, index) => `
${index + 1}. ${item.productName} (${item.sku})
   Quantity Picked: ${item.quantityPicked}
   Quantity Packed: ${item.quantityPacked}
   Price per Unit: $${item.pricePerUnit.toFixed(2)}
   Total: $${(item.quantityPacked * item.pricePerUnit).toFixed(2)}
`).join('')}

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
              <Badge className="bg-green-100 text-green-800">
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
                <p className="font-medium">{delivery.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Date</p>
                <p className="font-medium">{delivery.deliveryDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="font-medium">
                  {delivery.lineItems.reduce((sum, item) => sum + item.quantityPacked, 0)} units
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
                  {delivery.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantityPicked}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantityPacked}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.pricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.quantityPacked * item.pricePerUnit).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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

