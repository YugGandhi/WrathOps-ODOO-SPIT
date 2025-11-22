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

// Mock data for receipts (incoming goods)
const receipts = [
  { id: "R1", status: "pending", scheduleDate: new Date(2024, 0, 10) },
  { id: "R2", status: "pending", scheduleDate: new Date(2024, 0, 12) },
  { id: "R3", status: "pending", scheduleDate: new Date(2024, 0, 14) },
  { id: "R4", status: "pending", scheduleDate: new Date(2024, 0, 9) }, // Late
  { id: "R5", status: "done", scheduleDate: new Date(2024, 0, 8) },
  { id: "R6", status: "done", scheduleDate: new Date(2024, 0, 7) },
];

// Mock data for deliveries (outgoing goods)
const deliveries = [
  { id: "D1", status: "pending", scheduleDate: new Date(2024, 0, 11), waiting: false },
  { id: "D2", status: "pending", scheduleDate: new Date(2024, 0, 13), waiting: true },
  { id: "D3", status: "pending", scheduleDate: new Date(2024, 0, 9), waiting: false }, // Late
  { id: "D4", status: "pending", scheduleDate: new Date(2024, 0, 15), waiting: true },
  { id: "D5", status: "done", scheduleDate: new Date(2024, 0, 8), waiting: false },
  { id: "D6", status: "done", scheduleDate: new Date(2024, 0, 7), waiting: false },
];

// Calculate metrics
const pendingReceipts = receipts.filter(r => r.status === "pending").length;
const lateReceipts = receipts.filter(r => r.status === "pending" && r.scheduleDate < today).length;
const totalReceiptOperations = receipts.length;

const pendingDeliveries = deliveries.filter(d => d.status === "pending").length;
const lateDeliveries = deliveries.filter(d => d.status === "pending" && d.scheduleDate < today).length;
const waitingDeliveries = deliveries.filter(d => d.status === "pending" && d.waiting).length;
const totalDeliveryOperations = deliveries.length;

const kpis = [
  {
    title: "Total Products",
    value: "1,234",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "Low Stock Items",
    value: "23",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    title: "Pending Receipts",
    value: "15",
    icon: TruckIcon,
    color: "text-green-600",
  },
  {
    title: "Pending Deliveries",
    value: "8",
    icon: ShoppingBag,
    color: "text-purple-600",
  },
  {
    title: "Internal Transfers",
    value: "12",
    icon: ArrowRightLeft,
    color: "text-orange-600",
  },
];

const recentOperations = [
  {
    id: "1",
    date: "2024-01-15",
    reference: "WH/IN/0023",
    type: "Receipt",
    warehouse: "Main Warehouse",
    location: "Zone A",
    status: "Done",
  },
  {
    id: "2",
    date: "2024-01-15",
    reference: "WH/OUT/0045",
    type: "Delivery",
    warehouse: "Main Warehouse",
    location: "Loading Bay",
    status: "Ready",
  },
  {
    id: "3",
    date: "2024-01-14",
    reference: "WH/INT/0012",
    type: "Internal",
    warehouse: "Main Warehouse",
    location: "Zone A → Zone B",
    status: "In Progress",
  },
  {
    id: "4",
    date: "2024-01-14",
    reference: "WH/ADJ/0008",
    type: "Adjustment",
    warehouse: "Main Warehouse",
    location: "Zone C",
    status: "Done",
  },
  {
    id: "5",
    date: "2024-01-13",
    reference: "WH/IN/0022",
    type: "Receipt",
    warehouse: "Secondary Warehouse",
    location: "Receiving",
    status: "Waiting",
  },
];

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Waiting: "bg-yellow-100 text-yellow-800",
  Ready: "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Done: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
};

export default function Dashboard() {
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
              className="w-full justify-start text-base font-semibold"
              data-testid="button-pending-receipts"
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
              className="w-full justify-start text-base font-semibold"
              data-testid="button-pending-deliveries"
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
              <span className="text-yellow-600 font-semibold text-lg">
                {waitingDeliveries}
              </span>
              <span className="text-sm text-muted-foreground">waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold text-lg">
                {totalDeliveryOperations}
              </span>
              <span className="text-sm text-muted-foreground">operations</span>
            </div>
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
