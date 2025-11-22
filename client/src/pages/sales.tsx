import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
};

export default function Sales() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data: salesOrders = [], isLoading } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/sales-orders");
        if (!response.ok) {
          console.error("Sales orders fetch failed:", response.status, response.statusText);
          throw new Error(`Failed to fetch sales orders: ${response.status}`);
        }
        const data = await response.json();
        console.log("Sales - Fetched sales orders:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Sales - Fetch error:", error);
        throw error;
      }
    },
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/contacts?type=Customer");
        if (!response.ok) {
          console.error("Customers fetch failed:", response.status);
          return [];
        }
        const data = await response.json();
        console.log("Sales - Fetched customers:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Sales - Customers fetch error:", error);
        return [];
      }
    },
  });

  const customersMap = customers.reduce((acc: Record<string, string>, c: any) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const ordersWithCustomers = salesOrders.map((order: any) => ({
    ...order,
    customer: customersMap[order.customerId] || "Unknown",
    orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : "",
    total: parseFloat(order.total || 0).toFixed(2),
  }));

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/sales-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      toast({
        title: "Status updated",
        description: `Order status changed to ${status}`,
      });
      setOpenOrderId(null);
      setNewStatus("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const currentOrder = openOrderId ? ordersWithCustomers.find((o: any) => o.id === openOrderId) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Sales Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage sales orders and customer deliveries
          </p>
        </div>
        <Button onClick={() => setLocation("/sales/new")} data-testid="button-create-so">
          <Plus className="w-4 h-4 mr-2" />
          Create Sales Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference or customer..."
                  className="pl-10"
                  data-testid="input-search-so"
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Sales Orders Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading sales orders...
                    </TableCell>
                  </TableRow>
                ) : ordersWithCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No sales orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersWithCustomers.map((order: any) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover-elevate"
                    data-testid={`row-so-${order.id}`}
                  >
                    <TableCell className="font-medium">{order.reference}</TableCell>
                    <TableCell className="text-sm">{order.customer}</TableCell>
                    <TableCell className="text-sm">{order.orderDate}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.total}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[order.status]} cursor-pointer`}
                        data-testid={`badge-status-${order.id}`}
                        onClick={() => {
                          setOpenOrderId(order.id);
                          setNewStatus(order.status);
                        }}
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
        </CardContent>
      </Card>

      <Dialog open={!!openOrderId} onOpenChange={(open) => {
        if (!open) setOpenOrderId(null);
      }}>
        <DialogContent data-testid="dialog-change-so-status">
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
            <DialogDescription>
              {currentOrder && `Update the status for sales order ${currentOrder.reference}`}
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger id="status" data-testid="select-new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleStatusChange(currentOrder.id, newStatus)}
                className="w-full"
                data-testid="button-confirm-status"
              >
                Update Status
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
