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

// Mock data
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
