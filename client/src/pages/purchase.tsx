import { useState } from "react";
import { useLocation } from "wouter";
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

// Mock data
const purchaseOrders = [
  {
    id: "1",
    reference: "PO/2024/0001",
    vendor: "Timber Supplies Inc.",
    orderDate: "2024-01-10",
    total: "15,240.00",
    status: "Confirmed",
  },
  {
    id: "2",
    reference: "PO/2024/0002",
    vendor: "Hardware Wholesale Ltd.",
    orderDate: "2024-01-12",
    total: "8,950.00",
    status: "Received",
  },
  {
    id: "3",
    reference: "PO/2024/0003",
    vendor: "Paint & Coating Co.",
    orderDate: "2024-01-15",
    total: "3,200.00",
    status: "Draft",
  },
  {
    id: "4",
    reference: "PO/2024/0004",
    vendor: "Timber Supplies Inc.",
    orderDate: "2024-01-08",
    total: "22,500.00",
    status: "Received",
  },
];

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Received: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
};

export default function Purchase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState(purchaseOrders);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const handleStatusChange = (orderId: string, status: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
    toast({
      title: "Status updated",
      description: `Order status changed to ${status}`,
    });
    setOpenOrderId(null);
    setNewStatus("");
  };

  const currentOrder = openOrderId ? orders.find(o => o.id === openOrderId) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage purchase orders and vendor relationships
          </p>
        </div>
        <Button onClick={() => setLocation("/purchase/new")} data-testid="button-create-po">
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference or vendor..."
                  className="pl-10"
                  data-testid="input-search-po"
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
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Purchase Orders Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover-elevate"
                    data-testid={`row-po-${order.id}`}
                  >
                    <TableCell className="font-medium">{order.reference}</TableCell>
                    <TableCell className="text-sm">{order.vendor}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openOrderId} onOpenChange={(open) => {
        if (!open) setOpenOrderId(null);
      }}>
        <DialogContent data-testid="dialog-change-po-status">
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
            <DialogDescription>
              {currentOrder && `Update the status for purchase order ${currentOrder.reference}`}
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
                    <SelectItem value="Received">Received</SelectItem>
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
