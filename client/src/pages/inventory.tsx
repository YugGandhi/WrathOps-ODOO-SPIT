import { useState, useEffect } from "react";
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
import { Search, Plus, Eye, Edit, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
          console.error("Products fetch error:", errorData);
          throw new Error(errorData.error || `Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched products:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Products fetch exception:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/locations");
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        console.error("Locations fetch error:", error);
        return [];
      }
    },
  });

  // Create location map
  const locationsMap = locations.reduce((acc: Record<string, any>, loc: any) => {
    acc[loc.id] = loc;
    return acc;
  }, {});

  const getLowStockBadge = (onHand: number, minimumQuantity?: number) => {
    const threshold = minimumQuantity || 10;
    if (onHand < threshold) {
      return (
        <Badge variant="destructive" className="text-xs">
          Low Stock
        </Badge>
      );
    }
    return null;
  };

  // Debug: Log data on mount and when it changes
  useEffect(() => {
    console.log("=== INVENTORY DEBUG ===");
    console.log("Products:", products);
    console.log("Products length:", products.length);
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
  }, [products, isLoading, error]);

  const filteredProducts = products.filter((product: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-destructive space-y-2">
          <p className="font-semibold">Error loading products:</p>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
          <p className="text-sm">Check browser console for details</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}>
            Retry
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your products and stock levels {products.length > 0 && `(${products.length} products)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              console.log("Manual API test...");
              try {
                const response = await fetch("/api/products");
                const data = await response.json();
                console.log("Manual API response:", data);
                console.log("Response status:", response.status);
                queryClient.invalidateQueries({ queryKey: ["products"] });
                toast({
                  title: "Refreshed",
                  description: `Found ${Array.isArray(data) ? data.length : 0} products`,
                });
              } catch (error) {
                console.error("Manual API test error:", error);
                toast({
                  title: "Error",
                  description: "Failed to fetch products",
                  variant: "destructive",
                });
              }
            }}
          >
            Refresh
          </Button>
          <Button onClick={() => setLocation("/inventory/new")} data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or SKU..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-products"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-warehouse">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="a">Warehouse A</SelectItem>
                <SelectItem value="b">Warehouse B</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="raw">Raw Materials</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="finishing">Finishing</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-stock-level">
                <SelectValue placeholder="Stock Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low Stock Only</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Free to Use</TableHead>
                  <TableHead className="text-right">Price per Unit Cost</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: any) => {
                    const onHand = product.onHandQuantity || 0;
                    const reserved = product.reservedQuantity || 0;
                    const freeToUse = onHand - reserved;
                    const pricePerUnit = product.pricePerUnit ? parseFloat(product.pricePerUnit) : 0;
                    return (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.name}
                            {getLowStockBadge(onHand, product.minimumQuantity)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.sku}
                        </TableCell>
                        <TableCell className="text-sm">{product.category}</TableCell>
                        <TableCell className="text-right font-medium">
                          {onHand}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {reserved}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {freeToUse}
                        </TableCell>
                        <TableCell className="text-right">
                          ${pricePerUnit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.locationId && locationsMap[product.locationId]
                            ? `${locationsMap[product.locationId].name} (${locationsMap[product.locationId].shortcode})`
                            : product.locationId || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setLocation(`/inventory/${product.id}`)}
                              data-testid={`button-view-${product.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setLocation(`/inventory/${product.id}/edit`)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-adjust-${product.id}`}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
