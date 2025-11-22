import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  TruckIcon,
  ShoppingBag,
  ArrowRightLeft,
  Search,
} from "lucide-react";

// Get today's date for comparison
const today = new Date();
today.setHours(0, 0, 0, 0);

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Waiting: "bg-yellow-100 text-yellow-800",
  Ready: "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Done: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
  pending: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

export default function Dashboard() {
  const [expandedSection, setExpandedSection] = useState<"receipts" | "deliveries" | null>(null);

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          console.error("Products fetch failed:", response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        console.log("Dashboard - Fetched products:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Dashboard - Products fetch error:", error);
        return [];
      }
    },
  });

  // Fetch receipts
  const { data: receipts = [] } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/receipts");
        if (!response.ok) {
          console.error("Receipts fetch failed:", response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        console.log("Dashboard - Fetched receipts:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Dashboard - Receipts fetch error:", error);
        return [];
      }
    },
  });

  // Fetch delivery orders
  const { data: deliveries = [] } = useQuery({
    queryKey: ["delivery-orders"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/delivery-orders");
        if (!response.ok) {
          console.error("Deliveries fetch failed:", response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        console.log("Dashboard - Fetched deliveries:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Dashboard - Deliveries fetch error:", error);
        return [];
      }
    },
  });

  // Fetch stock moves
  const { data: stockMoves = [] } = useQuery({
    queryKey: ["stock-moves"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/stock-moves");
        if (!response.ok) {
          console.error("Stock moves fetch failed:", response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        console.log("Dashboard - Fetched stock moves:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Dashboard - Stock moves fetch error:", error);
        return [];
      }
    },
  });

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockItems = products.filter((p: any) => 
    (p.onHandQuantity || 0) <= (p.minimumQuantity || 0)
  ).length;

  const pendingReceipts = receipts.filter((r: any) => 
    r.status === "Draft" || r.status === "Ready"
  ).length;
  const lateReceipts = receipts.filter((r: any) => {
    if (r.status === "Done") return false;
    if (!r.scheduledDate) return false;
    const scheduleDate = new Date(r.scheduledDate);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate < today;
  }).length;
  const totalReceiptOperations = receipts.length;

  const pendingDeliveries = deliveries.filter((d: any) => 
    d.status === "Picked" || d.status === "Packed"
  ).length;
  const lateDeliveries = deliveries.filter((d: any) => {
    if (d.status === "Validated") return false;
    if (!d.deliveryDate) return false;
    const deliveryDate = new Date(d.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate < today;
  }).length;
  const totalDeliveryOperations = deliveries.length;

  const internalTransfers = stockMoves.filter((m: any) => m.type === "Internal").length;

  const kpis = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      title: "Pending Receipts",
      value: pendingReceipts.toString(),
      icon: TruckIcon,
      color: "text-green-600",
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries.toString(),
      icon: ShoppingBag,
      color: "text-purple-600",
    },
    {
      title: "Internal Transfers",
      value: internalTransfers.toString(),
      icon: ArrowRightLeft,
      color: "text-orange-600",
    },
  ];

  // Recent operations from stock moves
  const recentOperations = stockMoves
    .slice(0, 5)
    .map((move: any) => ({
      id: move.id,
      date: move.date ? new Date(move.date).toISOString().split('T')[0] : "",
      reference: move.reference,
      type: move.type,
      warehouse: move.toLocation,
      location: `${move.fromLocation} → ${move.toLocation}`,
      status: move.status,
    }));

  const getStatusLabel = (scheduleDate: Date | string) => {
    const date = scheduleDate instanceof Date ? scheduleDate : new Date(scheduleDate);
    date.setHours(0, 0, 0, 0);
    if (date < today) return "Late";
    return "Upcoming";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your inventory and stock operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold" data-testid={`text-kpi-value-${index}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receipt and Delivery Cards with Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Receipt Block */}
        <Card className="lg:col-span-1" data-testid="card-pending-receipts">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-green-600" />
              Pending Receipts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-base font-semibold hover-elevate"
              data-testid="button-pending-receipts"
              onClick={() => setExpandedSection(expandedSection === "receipts" ? null : "receipts")}
            >
              <span className="text-2xl font-bold text-green-600 mr-2">
                {pendingReceipts}
              </span>
              to receive
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold text-lg">
                {lateReceipts}
              </span>
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold text-lg">
                {totalReceiptOperations}
              </span>
              <span className="text-sm text-muted-foreground">operations</span>
            </div>

            {expandedSection === "receipts" && (
              <div className="mt-4 pt-4 border-t space-y-2" data-testid="section-receipts-details">
                <div className="text-sm font-semibold mb-3">Pending Receipts Details</div>
                {receipts
                  .filter((r: any) => r.status === "Draft" || r.status === "Ready")
                  .map((receipt: any) => {
                    const scheduleDate = receipt.scheduledDate ? new Date(receipt.scheduledDate) : new Date();
                    return (
                      <div
                        key={receipt.id}
                        className="p-3 bg-muted rounded-md text-sm"
                        data-testid={`receipt-detail-${receipt.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{receipt.receiptNumber}</span>
                          <Badge
                            variant="secondary"
                            className={getStatusLabel(scheduleDate) === "Late" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                          >
                            {getStatusLabel(scheduleDate)}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Schedule: {scheduleDate.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Block */}
        <Card className="lg:col-span-1" data-testid="card-pending-deliveries">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              Pending Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-base font-semibold hover-elevate"
              data-testid="button-pending-deliveries"
              onClick={() => setExpandedSection(expandedSection === "deliveries" ? null : "deliveries")}
            >
              <span className="text-2xl font-bold text-purple-600 mr-2">
                {pendingDeliveries}
              </span>
              to Deliver
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold text-lg">
                {lateDeliveries}
              </span>
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold text-lg">
                {totalDeliveryOperations}
              </span>
              <span className="text-sm text-muted-foreground">operations</span>
            </div>

            {expandedSection === "deliveries" && (
              <div className="mt-4 pt-4 border-t space-y-2" data-testid="section-deliveries-details">
                <div className="text-sm font-semibold mb-3">Pending Deliveries Details</div>
                {deliveries
                  .filter((d: any) => d.status === "Picked" || d.status === "Packed")
                  .map((delivery: any) => {
                    const deliveryDate = delivery.deliveryDate ? new Date(delivery.deliveryDate) : new Date();
                    return (
                      <div
                        key={delivery.id}
                        className="p-3 bg-muted rounded-md text-sm"
                        data-testid={`delivery-detail-${delivery.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{delivery.deliveryNumber}</span>
                          <div className="flex gap-2">
                            <Badge
                              variant="secondary"
                              className={getStatusLabel(deliveryDate) === "Late" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}
                            >
                              {getStatusLabel(deliveryDate)}
                            </Badge>
                            <Badge variant="secondary" className={
                              delivery.status === "Picked" ? "bg-blue-100 text-blue-800" :
                              delivery.status === "Packed" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }>
                              {delivery.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Delivery Date: {deliveryDate.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend Card */}
        <Card className="lg:col-span-1" data-testid="card-status-legend">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Definitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-testid="legend-late">
              <p className="font-semibold text-sm text-red-600 mb-1">Late</p>
              <p className="text-xs text-muted-foreground">
                Schedule date &lt; today's date. This means the operation is overdue.
              </p>
            </div>
            <div data-testid="legend-operations">
              <p className="font-semibold text-sm text-blue-600 mb-1">Operations</p>
              <p className="text-xs text-muted-foreground">
                Schedule date &gt; today's date. Meaning these are upcoming, planned tasks.
              </p>
            </div>
            <div data-testid="legend-waiting">
              <p className="font-semibold text-sm text-yellow-600 mb-1">Waiting</p>
              <p className="text-xs text-muted-foreground">
                Waiting for the stocks. Meaning items required for this operation are not yet available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search operations..."
                  className="pl-10"
                  data-testid="input-search-operations"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-document-type">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-warehouse">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="main">Main Warehouse</SelectItem>
                <SelectItem value="secondary">Secondary Warehouse</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-clear-filters">
              Clear Filters
            </Button>
          </div>

          {/* Operations Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOperations.map((operation) => (
                  <TableRow key={operation.id} data-testid={`row-operation-${operation.id}`}>
                    <TableCell className="text-sm">{operation.date}</TableCell>
                    <TableCell className="font-medium">{operation.reference}</TableCell>
                    <TableCell className="text-sm">{operation.type}</TableCell>
                    <TableCell className="text-sm">{operation.warehouse}</TableCell>
                    <TableCell className="text-sm">{operation.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[operation.status]}
                        data-testid={`badge-status-${operation.id}`}
                      >
                        {operation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
