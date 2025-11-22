import { Link } from "wouter";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { Skeleton } from "@/components/ui/skeleton";

export default function Purchase() {
  const { data: orders, isLoading } = usePurchaseOrders();
  const purchaseOrders = orders || [];
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage vendor orders and procurement</p>
        </div>
        <Link href="/purchase/new">
          <Button className="gap-2" data-testid="button-create-order">
            <Plus className="h-4 w-4" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Purchase Order List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or vendor..."
                className="pl-9"
                data-testid="input-search"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No purchase orders found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <TableRow key={order.id} className="hover-elevate" data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-mono text-sm font-medium">{order.reference}</TableCell>
                      <TableCell>{order.vendor}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">${order.total}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/purchase/${order.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${order.id}`}>
                              View
                            </Button>
                          </Link>
                          <Link href={`/purchase/${order.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${order.id}`}>
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
