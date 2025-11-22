import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Settings } from "lucide-react";

export default function ProductDetails() {
  const [match, params] = useRoute("/inventory/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id;

  // Fetch product
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!productId,
  });

  // Fetch stock moves for this product
  const { data: stockMoves = [] } = useQuery({
    queryKey: ["stock-moves", productId],
    queryFn: async () => {
      const response = await fetch("/api/stock-moves");
      if (!response.ok) return [];
      const allMoves = await response.json();
      return allMoves.filter((move: any) => move.productId === productId);
    },
    enabled: !!productId,
  });

  if (productLoading) {
    return (
      <div className="p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/inventory")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Product Not Found</h1>
            <p className="text-sm text-muted-foreground mt-1">
              The product you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stock history from stock moves
  let runningBalance = product.onHandQuantity || 0;
  const stockHistory = stockMoves
    .map((move: any) => {
      const quantity = move.quantity || 0;
      runningBalance -= quantity; // Reverse chronological order
      return {
        id: move.id,
        date: move.date ? new Date(move.date).toISOString().split('T')[0] : "",
        reference: move.reference,
        type: move.type,
        quantity: quantity > 0 ? `+${quantity}` : `${quantity}`,
        balance: runningBalance + quantity,
      };
    })
    .reverse(); // Show in chronological order

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/inventory")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-product-name">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            data-testid="button-adjust-quantity"
          >
            <Settings className="w-4 h-4 mr-2" />
            Adjust Quantity
          </Button>
          <Button
            onClick={() => setLocation(`/inventory/${match?.params.id}/edit`)}
            data-testid="button-edit-product"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="locations" data-testid="tab-locations">Locations</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit of Measure</p>
                  <p className="text-sm font-medium">{product.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">On Hand</p>
                  <p className="text-sm font-semibold" data-testid="text-on-hand">{product.onHandQuantity || 0}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-sm" data-testid="text-reserved">{product.reservedQuantity || 0}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Free to Use</p>
                  <p className="text-sm" data-testid="text-free-to-use">
                    {(product.onHandQuantity || 0) - (product.reservedQuantity || 0)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Minimum Quantity</p>
                  <p className="text-sm">{product.minimumQuantity || 0}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {(product.onHandQuantity || 0) <= (product.minimumQuantity || 0) ? (
                    <Badge variant="destructive">Low Stock</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Reordering Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Preferred Supplier</p>
                <p className="text-sm font-medium">{product.preferredSupplier || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{product.location || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Storage Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.location ? (
                      <TableRow>
                        <TableCell className="font-medium">{product.location}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right font-medium">{product.onHandQuantity || 0}</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No location information available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Stock Move History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No stock history available
                        </TableCell>
                      </TableRow>
                    ) : (
                      stockHistory.map((move: any) => (
                        <TableRow key={move.id}>
                          <TableCell className="text-sm">{move.date}</TableCell>
                          <TableCell className="font-medium">{move.reference}</TableCell>
                          <TableCell className="text-sm">{move.type}</TableCell>
                          <TableCell className={`text-right font-medium ${move.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {move.quantity}
                          </TableCell>
                          <TableCell className="text-right font-medium">{move.balance}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
