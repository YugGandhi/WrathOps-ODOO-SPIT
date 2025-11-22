import { useState } from "react";
import { Link } from "wouter";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManufacturingOrders } from "@/hooks/use-manufacturing";
import { Skeleton } from "@/components/ui/skeleton";

export default function Manufacturing() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const { data: orders, isLoading } = useManufacturingOrders();

  const manufacturingOrders = orders || [];
  const kanbanColumns = {
    draft: manufacturingOrders.filter(o => o.status === "draft"),
    ready: manufacturingOrders.filter(o => o.status === "ready"),
    in_progress: manufacturingOrders.filter(o => o.status === "in_progress"),
    done: manufacturingOrders.filter(o => o.status === "done"),
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Manufacturing Orders</h1>
          <p className="text-muted-foreground mt-1">Manage production and manufacturing operations</p>
        </div>
        <Button className="gap-2" data-testid="button-add-order">
          <Plus className="h-4 w-4" />
          New Manufacturing Order
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-lg font-semibold">Orders</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("table")}
              data-testid="button-table-view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("kanban")}
              data-testid="button-kanban-view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by reference or contact..."
              className="max-w-sm"
              data-testid="input-search"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : manufacturingOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No manufacturing orders found.</p>
            </div>
          ) : view === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Schedule Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manufacturingOrders.map((order) => (
                    <TableRow key={order.id} className="hover-elevate" data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-mono text-sm font-medium">{order.reference}</TableCell>
                      <TableCell>{order.contact}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.scheduleDate ? new Date(order.scheduleDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.quantity} {order.unitOfMeasure}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/manufacturing/${order.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-${order.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(kanbanColumns).map(([status, orders]) => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      {status.replace("_", " ")}
                    </h3>
                    <span className="text-xs text-muted-foreground">{orders.length}</span>
                  </div>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <Link key={order.id} href={`/manufacturing/${order.id}`}>
                        <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-order-${order.id}`}>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <p className="font-mono text-sm font-medium">{order.reference}</p>
                              <p className="text-sm text-muted-foreground">{order.contact}</p>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Qty:</span>
                              <span className="font-medium">{order.quantity} {order.unitOfMeasure}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Date:</span>
                              <span className="font-mono text-xs">
                                {order.scheduleDate ? new Date(order.scheduleDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
