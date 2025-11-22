import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, LayoutGrid, List } from "lucide-react";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Ready: "bg-blue-100 text-blue-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Done: "bg-green-100 text-green-800",
};

export default function Manufacturing() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const { data: manufacturingOrders = [], isLoading } = useQuery({
    queryKey: ["manufacturing-orders"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/manufacturing-orders");
        if (!response.ok) {
          console.error("Manufacturing orders fetch failed:", response.status, response.statusText);
          throw new Error(`Failed to fetch manufacturing orders: ${response.status}`);
        }
        const data = await response.json();
        console.log("Manufacturing - Fetched orders:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Manufacturing - Fetch error:", error);
        throw error;
      }
    },
  });

  const groupedByStatus = manufacturingOrders.reduce((acc: Record<string, any[]>, order: any) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Manufacturing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage manufacturing orders and operations
          </p>
        </div>
        <Button onClick={() => setLocation("/manufacturing/new")} data-testid="button-add-mo">
          <Plus className="w-4 h-4 mr-2" />
          New Manufacturing Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Manufacturing Orders</CardTitle>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="table" data-testid="view-table">
                  <List className="w-4 h-4 mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="kanban" data-testid="view-kanban">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference or contact..."
                  className="pl-10"
                  data-testid="input-search-mo"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Schedule Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading manufacturing orders...
                      </TableCell>
                    </TableRow>
                  ) : manufacturingOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No manufacturing orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    manufacturingOrders.map((order: any) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setLocation(`/manufacturing/${order.id}`)}
                        data-testid={`row-mo-${order.id}`}
                      >
                        <TableCell className="font-medium">{order.reference}</TableCell>
                        <TableCell className="text-sm">{order.contact || "N/A"}</TableCell>
                        <TableCell className="text-sm">
                          {order.scheduleDate ? new Date(order.scheduleDate).toISOString().split('T')[0] : "N/A"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {order.quantity || 0} {order.unitOfMeasure || ""}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[order.status] || "bg-gray-100 text-gray-800"}
                            data-testid={`badge-status-${order.id}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {["Draft", "Ready", "In Progress", "Done"].map((status) => (
                <div key={status} className="flex-shrink-0 w-80">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{status}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {groupedByStatus[status]?.length || 0}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {groupedByStatus[status]?.map((order: any) => (
                        <Card
                          key={order.id}
                          className="cursor-pointer hover-elevate"
                          onClick={() => setLocation(`/manufacturing/${order.id}`)}
                          data-testid={`card-mo-${order.id}`}
                        >
                          <CardContent className="p-4 space-y-2">
                            <p className="font-medium text-sm">{order.reference}</p>
                            <p className="text-xs text-muted-foreground">{order.contact || "N/A"}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {order.scheduleDate ? new Date(order.scheduleDate).toISOString().split('T')[0] : "N/A"}
                              </span>
                              <span className="font-medium">
                                {order.quantity || 0} {order.unitOfMeasure || ""}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
