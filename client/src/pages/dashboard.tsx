import { Package, AlertTriangle, TrendingDown, TrendingUp, ArrowRightLeft } from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const recentOperations = [
  {
    id: "1",
    date: "2024-11-20",
    reference: "WH/IN/0001",
    type: "Receipt",
    warehouse: "Main Warehouse",
    locations: "Zone A → Shelf 12",
    status: "done" as const,
  },
  {
    id: "2",
    date: "2024-11-20",
    reference: "WH/OUT/0045",
    type: "Delivery",
    warehouse: "Main Warehouse",
    locations: "Shelf 8 → Customer",
    status: "ready" as const,
  },
  {
    id: "3",
    date: "2024-11-19",
    reference: "WH/INT/0023",
    type: "Internal",
    warehouse: "Warehouse A",
    locations: "Zone A → Zone B",
    status: "in_progress" as const,
  },
  {
    id: "4",
    date: "2024-11-19",
    reference: "WH/ADJ/0012",
    type: "Adjustment",
    warehouse: "Main Warehouse",
    locations: "Shelf 15",
    status: "draft" as const,
  },
  {
    id: "5",
    date: "2024-11-18",
    reference: "WH/IN/0002",
    type: "Receipt",
    warehouse: "Warehouse B",
    locations: "Loading Dock → Zone C",
    status: "waiting" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your inventory operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Products in Stock"
          value="1,248"
          icon={Package}
          trend={{ value: "+12% from last month", isPositive: true }}
        />
        <KPICard
          title="Low Stock / Out of Stock"
          value="23"
          icon={AlertTriangle}
          trend={{ value: "5 critical items", isPositive: false }}
        />
        <KPICard
          title="Pending Receipts"
          value="18"
          icon={TrendingDown}
        />
        <KPICard
          title="Pending Deliveries"
          value="12"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Recent Operations</CardTitle>
          <Button variant="outline" size="sm" data-testid="button-view-all">
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-document-type">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="delivery">Deliveries</SelectItem>
                <SelectItem value="internal">Internal Transfers</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search warehouse..."
              className="w-[200px]"
              data-testid="input-search-warehouse"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOperations.map((operation) => (
                  <TableRow key={operation.id} className="hover-elevate" data-testid={`row-operation-${operation.id}`}>
                    <TableCell className="font-mono text-sm">{operation.date}</TableCell>
                    <TableCell className="font-mono text-sm font-medium">{operation.reference}</TableCell>
                    <TableCell>{operation.type}</TableCell>
                    <TableCell>{operation.warehouse}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{operation.locations}</TableCell>
                    <TableCell>
                      <StatusBadge status={operation.status} />
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
