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
import { Search, Plus, Eye, Edit, Settings } from "lucide-react";

// Mock data
const products = [
  {
    id: "1",
    name: "Oak Wood Plank",
    sku: "OWP-001",
    category: "Raw Materials",
    onHand: 450,
    reserved: 120,
    pricePerUnit: 12.50,
    location: "Warehouse A - Zone 1",
  },
  {
    id: "2",
    name: "Metal Brackets Set",
    sku: "MBS-045",
    category: "Hardware",
    onHand: 1200,
    reserved: 300,
    pricePerUnit: 8.75,
    location: "Warehouse A - Zone 2",
  },
  {
    id: "3",
    name: "Paint - White Gloss",
    sku: "PNT-WG-5L",
    category: "Finishing",
    onHand: 15,
    reserved: 10,
    pricePerUnit: 45.00,
    location: "Warehouse B - Zone 1",
  },
  {
    id: "4",
    name: "Screws Box (1000 pcs)",
    sku: "SCR-1000",
    category: "Hardware",
    onHand: 85,
    reserved: 25,
    pricePerUnit: 15.99,
    location: "Warehouse A - Zone 2",
  },
  {
    id: "5",
    name: "Pine Wood Board",
    sku: "PWB-002",
    category: "Raw Materials",
    onHand: 5,
    reserved: 0,
    pricePerUnit: 9.25,
    location: "Warehouse A - Zone 1",
  },
];

export default function Inventory() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const getLowStockBadge = (onHand: number) => {
    // Low stock threshold: less than 10 units
    if (onHand < 10) {
      return (
        <Badge variant="destructive" className="text-xs">
          Low Stock
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your products and stock levels
          </p>
        </div>
        <Button onClick={() => setLocation("/inventory/new")} data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
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
                {products.map((product) => {
                  const freeToUse = product.onHand - product.reserved;
                  return (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {getLowStockBadge(product.onHand)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-sm">{product.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {product.onHand}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {product.reserved}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {freeToUse}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.pricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.location}
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
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
