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
import { Search, Plus } from "lucide-react";

export default function StockMoves() {
  const [, setLocation] = useLocation();

  const { data: stockMoves = [], isLoading: movesLoading } = useQuery({
    queryKey: ["stock-moves"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/stock-moves");
        if (!response.ok) {
          console.error("Stock moves fetch failed:", response.status, response.statusText);
          throw new Error(`Failed to fetch stock moves: ${response.status}`);
        }
        const data = await response.json();
        console.log("Stock Moves - Fetched stock moves:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Stock Moves - Fetch error:", error);
        throw error;
      }
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          console.error("Products fetch failed:", response.status);
          return [];
        }
        const data = await response.json();
        console.log("Stock Moves - Fetched products:", data?.length || 0, "items");
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Stock Moves - Products fetch error:", error);
        return [];
      }
    },
  });

  const productsMap = products.reduce((acc: Record<string, any>, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const stockMovesWithProducts = stockMoves.map((move: any) => {
    const product = productsMap[move.productId];
    return {
      ...move,
      product: product?.name || "Unknown Product",
      date: move.date ? new Date(move.date).toISOString().split('T')[0] : "",
    };
  });

  const statusColors: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-800",
    Waiting: "bg-yellow-100 text-yellow-800",
    Ready: "bg-blue-100 text-blue-800",
    Done: "bg-green-100 text-green-800",
    Canceled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Stock Moves</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage stock movements between locations
          </p>
        </div>
        <Button onClick={() => setLocation("/stock-moves/new")} data-testid="button-create-move">
          <Plus className="w-4 h-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stock Movements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference or product..."
                  className="pl-10"
                  data-testid="input-search-moves"
                />
              </div>
            </div>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
            <Select>
              <SelectTrigger className="w-48" data-testid="select-location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="wa-z1">Warehouse A - Zone 1</SelectItem>
                <SelectItem value="wa-z2">Warehouse A - Zone 2</SelectItem>
                <SelectItem value="wb-z1">Warehouse B - Zone 1</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-type">
                <SelectValue placeholder="Type" />
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
          </div>

          {/* Stock Moves Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>From Location</TableHead>
                  <TableHead>To Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading stock moves...
                    </TableCell>
                  </TableRow>
                ) : stockMovesWithProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No stock moves found
                    </TableCell>
                  </TableRow>
                ) : (
                  stockMovesWithProducts.map((move: any) => (
                    <TableRow
                      key={move.id}
                      className="cursor-pointer hover-elevate"
                      data-testid={`row-move-${move.id}`}
                    >
                      <TableCell className="text-sm">{move.date}</TableCell>
                      <TableCell className="font-medium">{move.reference}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            move.type === "Receipt" ? "bg-green-50 text-green-700 border-green-200" :
                            move.type === "Delivery" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            move.type === "Internal" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {move.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{move.product}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {move.fromLocation}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {move.toLocation}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${move.quantity < 0 ? 'text-red-600' : ''}`}>
                        {move.quantity > 0 ? '+' : ''}{move.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[move.status] || "bg-gray-100 text-gray-800"}
                          data-testid={`badge-status-${move.id}`}
                        >
                          {move.status}
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
    </div>
  );
}
