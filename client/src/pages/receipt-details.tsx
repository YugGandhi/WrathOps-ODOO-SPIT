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

// Mock warehouses with shortcodes
const mockWarehouses: Record<string, string> = {
  "1": "mw/za",
  "2": "mw/zb",
  "3": "mw/zc",
  "4": "mw/main",
};

// Mock receipt data
const mockReceipts = [
  {
    id: "1",
    receiptNumber: "REC/2024/0001",
    supplier: "Timber Supplies Inc.",
    warehouseId: "1",
    scheduledDate: "2024-01-10",
    receiptDate: "2024-01-10",
    status: "Draft",
    lineItems: [
      { productName: "Oak Wood Plank", sku: "OWP-001", quantityReceived: 50, pricePerUnit: 12.50 },
      { productName: "Pine Wood Board", sku: "PWB-002", quantityReceived: 30, pricePerUnit: 9.25 },
    ],
  },
  {
    id: "2",
    receiptNumber: "REC/2024/0002",
    supplier: "Hardware Wholesale Ltd.",
    warehouseId: "2",
    scheduledDate: "2024-01-12",
    receiptDate: "2024-01-12",
    status: "Ready",
    lineItems: [
      { productName: "Metal Brackets Set", sku: "MBS-045", quantityReceived: 100, pricePerUnit: 8.75 },
      { productName: "Screws Box (1000 pcs)", sku: "SCR-1000", quantityReceived: 25, pricePerUnit: 15.99 },
    ],
  },
  {
    id: "3",
    receiptNumber: "REC/2024/0003",
    supplier: "Metal Works Corp.",
    warehouseId: "1",
    scheduledDate: "2024-01-15",
    receiptDate: "2024-01-15",
    status: "Done",
    lineItems: [
      { productName: "Steel Rods", sku: "STR-001", quantityReceived: 50, pricePerUnit: 18.50 },
    ],
  },
];

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Ready: "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

export default function ReceiptDetails() {
  const [match, params] = useRoute("/purchase/receipt/:id");
  const [, setLocation] = useLocation();

  const receiptId = params?.id;
  const receipt = receiptId ? mockReceipts.find(r => r.id === receiptId) : null;

  const calculateTotal = () => {
    if (!receipt) return 0;
    return receipt.lineItems.reduce((sum, item) => 
      sum + (item.quantityReceived * item.pricePerUnit), 0
    );
  };

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
Supplier: ${receipt.supplier}
To (Location Shortcode): ${mockWarehouses[receipt.warehouseId] || "N/A"}
Scheduled Date: ${receipt.scheduledDate}
Receipt Date: ${receipt.receiptDate}
Status: ${receipt.status}

PRODUCTS RECEIVED
=================

${receipt.lineItems.map((item, index) => `
${index + 1}. ${item.productName} (${item.sku})
   Quantity: ${item.quantityReceived}
   Price per Unit: $${item.pricePerUnit.toFixed(2)}
   Total: $${(item.quantityReceived * item.pricePerUnit).toFixed(2)}
`).join('')}

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
                <p className="font-medium">{receipt.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To (Location Shortcode)</p>
                <p className="font-medium">{mockWarehouses[receipt.warehouseId] || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">{receipt.scheduledDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receipt Date</p>
                <p className="font-medium">{receipt.receiptDate}</p>
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
                  {receipt.lineItems.reduce((sum, item) => sum + item.quantityReceived, 0)} units
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
                  {receipt.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantityReceived}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.pricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.quantityReceived * item.pricePerUnit).toFixed(2)}
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
                  Stock levels have been automatically increased for all products listed above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

