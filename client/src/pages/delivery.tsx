import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Plus, Eye, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  Picked: "bg-blue-100 text-blue-800",
  Packed: "bg-yellow-100 text-yellow-800",
  Validated: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

export default function Delivery() {
  const [, setLocation] = useLocation();

  const { data: deliveryOrders = [], isLoading: deliveriesLoading } = useQuery({
    queryKey: ["delivery-orders"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/delivery-orders");
        if (!response.ok) {
          console.error("Delivery orders fetch failed:", response.status, response.statusText);
          throw new Error(`Failed to fetch delivery orders: ${response.status}`);
        }
        const data = await response.json();
        console.log("Delivery - Fetched delivery orders:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Delivery - Delivery orders fetch error:", error);
        throw error;
      }
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/contacts");
        if (!response.ok) {
          console.error("Contacts fetch failed:", response.status);
          return [];
        }
        const data = await response.json();
        console.log("Delivery - Fetched contacts:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Delivery - Contacts fetch error:", error);
        return [];
      }
    },
  });

  const { data: deliveryLineItemsMap = {} } = useQuery({
    queryKey: ["delivery-line-items", deliveryOrders.map((d: any) => d.id)],
    queryFn: async () => {
      const itemsMap: Record<string, any[]> = {};
      await Promise.all(
        deliveryOrders.map(async (delivery: any) => {
          try {
            const response = await fetch(`/api/delivery-orders/${delivery.id}/line-items`);
            if (response.ok) {
              itemsMap[delivery.id] = await response.json();
            }
          } catch (error) {
            console.error(`Failed to fetch line items for delivery ${delivery.id}`, error);
          }
        })
      );
      return itemsMap;
    },
    enabled: deliveryOrders.length > 0,
  });

  const contactsMap = contacts.reduce((acc: Record<string, string>, c: any) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const deliveriesWithTotals = deliveryOrders.map((delivery: any) => {
    const lineItems = deliveryLineItemsMap[delivery.id] || [];
    const totalItems = lineItems.reduce((sum: number, item: any) => sum + (item.quantityPacked || 0), 0);
    const totalCost = lineItems.reduce((sum: number, item: any) => {
      const qty = item.quantityPacked || 0;
      const price = parseFloat(item.pricePerUnit || 0);
      return sum + (qty * price);
    }, 0);
    
    return {
      ...delivery,
      totalItems,
      totalCost,
      customer: contactsMap[delivery.customerId] || "Unknown",
      deliveryDate: delivery.deliveryDate ? new Date(delivery.deliveryDate).toISOString().split('T')[0] : "",
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Delivery Orders (Outgoing Goods)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage delivery orders - items shipped to customers. Stock decreases automatically upon validation.
          </p>
        </div>
        <Button onClick={() => setLocation("/delivery/new")} data-testid="button-create-delivery">
          <Plus className="w-4 h-4 mr-2" />
          Create Delivery Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by delivery number or customer..."
                  className="pl-10"
                  data-testid="input-search-deliveries"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Delivery Orders Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead className="text-right">Total Items</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading delivery orders...
                    </TableCell>
                  </TableRow>
                ) : deliveriesWithTotals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No delivery orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveriesWithTotals.map((delivery: any) => (
                    <TableRow
                      key={delivery.id}
                      data-testid={`row-delivery-${delivery.id}`}
                    >
                      <TableCell className="font-medium">{delivery.deliveryNumber}</TableCell>
                      <TableCell className="text-sm">{delivery.customer}</TableCell>
                      <TableCell className="text-sm">{delivery.deliveryDate}</TableCell>
                      <TableCell className="text-right font-medium">
                        {delivery.totalItems} units
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${delivery.totalCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[delivery.status] || "bg-gray-100 text-gray-800"}
                          data-testid={`badge-status-${delivery.id}`}
                        >
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/delivery/${delivery.id}`)}
                            data-testid={`button-view-delivery-${delivery.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/delivery/${delivery.id}/edit`)}
                            data-testid={`button-edit-delivery-${delivery.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

