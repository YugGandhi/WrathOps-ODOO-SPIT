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
import { Search, Plus, Eye, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Ready: "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
  Validated: "bg-green-100 text-green-800", // Legacy support
};

export default function Purchase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: receipts = [], isLoading: receiptsLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/receipts");
        if (!response.ok) {
          console.error("Receipts fetch failed:", response.status, response.statusText);
          throw new Error(`Failed to fetch receipts: ${response.status}`);
        }
        const data = await response.json();
        console.log("Purchase - Fetched receipts:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Purchase - Receipts fetch error:", error);
        throw error;
      }
    },
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/warehouses");
        if (!response.ok) {
          console.error("Warehouses fetch failed:", response.status);
          return [];
        }
        const data = await response.json();
        console.log("Purchase - Fetched warehouses:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Purchase - Warehouses fetch error:", error);
        return [];
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
        console.log("Purchase - Fetched contacts:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Purchase - Contacts fetch error:", error);
        return [];
      }
    },
  });

  const { data: receiptLineItemsMap = {} } = useQuery({
    queryKey: ["receipt-line-items", receipts.map((r: any) => r.id)],
    queryFn: async () => {
      const itemsMap: Record<string, any[]> = {};
      await Promise.all(
        receipts.map(async (receipt: any) => {
          try {
            const response = await fetch(`/api/receipts/${receipt.id}/line-items`);
            if (response.ok) {
              itemsMap[receipt.id] = await response.json();
            }
          } catch (error) {
            console.error(`Failed to fetch line items for receipt ${receipt.id}`, error);
          }
        })
      );
      return itemsMap;
    },
    enabled: receipts.length > 0,
  });

  const warehousesMap = warehouses.reduce((acc: Record<string, string>, w: any) => {
    acc[w.id] = w.shortcode || w.name;
    return acc;
  }, {});

  const contactsMap = contacts.reduce((acc: Record<string, string>, c: any) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const receiptsWithTotals = receipts.map((receipt: any) => {
    const lineItems = receiptLineItemsMap[receipt.id] || [];
    const totalItems = lineItems.reduce((sum: number, item: any) => sum + (item.quantityReceived || 0), 0);
    const totalCost = lineItems.reduce((sum: number, item: any) => {
      const qty = item.quantityReceived || 0;
      const price = parseFloat(item.pricePerUnit || 0);
      return sum + (qty * price);
    }, 0);
    
    return {
      ...receipt,
      totalItems,
      totalCost,
      supplier: contactsMap[receipt.supplierId] || "Unknown",
      warehouseShortcode: warehousesMap[receipt.warehouseId] || "N/A",
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : "",
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Receipts (Incoming Goods)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage receipts - items received from vendors. Stock increases automatically upon validation.
          </p>
        </div>
        <Button onClick={() => setLocation("/purchase/new")} data-testid="button-create-receipt">
          <Plus className="w-4 h-4 mr-2" />
          Create Receipt
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Receipts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by receipt number or supplier..."
                  className="pl-10"
                  data-testid="input-search-receipts"
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
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Receipts Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>To (Location Shortcode)</TableHead>
                  <TableHead>Receipt Date</TableHead>
                  <TableHead className="text-right">Total Items</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading receipts...
                    </TableCell>
                  </TableRow>
                ) : receiptsWithTotals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No receipts found
                    </TableCell>
                  </TableRow>
                ) : (
                  receiptsWithTotals.map((receipt: any) => (
                    <TableRow
                      key={receipt.id}
                      data-testid={`row-receipt-${receipt.id}`}
                    >
                      <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                      <TableCell className="text-sm">{receipt.supplier}</TableCell>
                      <TableCell className="text-sm">{receipt.warehouseShortcode}</TableCell>
                      <TableCell className="text-sm">{receipt.receiptDate}</TableCell>
                      <TableCell className="text-right font-medium">
                        {receipt.totalItems} units
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${receipt.totalCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[receipt.status] || "bg-gray-100 text-gray-800"}
                          data-testid={`badge-status-${receipt.id}`}
                        >
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/purchase/receipt/${receipt.id}`)}
                            data-testid={`button-view-receipt-${receipt.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/purchase/${receipt.id}/edit`)}
                            data-testid={`button-edit-receipt-${receipt.id}`}
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
