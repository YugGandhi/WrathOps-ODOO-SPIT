import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products, isLoading } = useProducts();

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your product stock and inventory</p>
        </div>
        <Link href="/inventory/new">
          <Button className="gap-2" data-testid="button-add-product">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-warehouse">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="main">Main Warehouse</SelectItem>
                <SelectItem value="a">Warehouse A</SelectItem>
                <SelectItem value="b">Warehouse B</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="raw">Raw Materials</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="finishing">Finishing</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2" data-testid="button-filter">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products found. Add your first product to get started.</p>
              <Link href="/inventory/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Forecasted</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover-elevate" data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${product.onHandQuantity < 50 ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {product.onHandQuantity}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{product.reservedQuantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{product.forecastedQuantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/inventory/${product.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${product.id}`}>
                              View
                            </Button>
                          </Link>
                          <Link href={`/inventory/${product.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${product.id}`}>
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
