import { useRoute, useLocation } from "wouter";
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

// Mock data
const product = {
  id: "1",
  name: "Oak Wood Plank",
  sku: "OWP-001",
  category: "Raw Materials",
  unitOfMeasure: "pieces",
  description: "High-quality oak wood planks for furniture manufacturing",
  onHand: 450,
  reserved: 120,
  forecasted: 600,
  minimumQuantity: 100,
  preferredSupplier: "Timber Supplies Inc.",
};

const locations = [
  { warehouse: "Warehouse A", zone: "Zone 1", quantity: 300 },
  { warehouse: "Warehouse A", zone: "Zone 3", quantity: 150 },
];

const stockHistory = [
  {
    id: "1",
    date: "2024-01-15",
    reference: "WH/IN/0023",
    type: "Receipt",
    quantity: "+200",
    balance: 450,
  },
  {
    id: "2",
    date: "2024-01-10",
    reference: "WH/OUT/0041",
    type: "Delivery",
    quantity: "-50",
    balance: 250,
  },
  {
    id: "3",
    date: "2024-01-05",
    reference: "WH/ADJ/0007",
    type: "Adjustment",
    quantity: "+10",
    balance: 300,
  },
];

export default function ProductDetails() {
  const [match] = useRoute("/inventory/:id");
  const [, setLocation] = useLocation();

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
                  <p className="text-sm font-semibold" data-testid="text-on-hand">{product.onHand}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-sm" data-testid="text-reserved">{product.reserved}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Forecasted</p>
                  <p className="text-sm" data-testid="text-forecasted">{product.forecasted}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Minimum Quantity</p>
                  <p className="text-sm">{product.minimumQuantity}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {product.onHand <= product.minimumQuantity ? (
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
                <p className="text-sm font-medium">{product.preferredSupplier}</p>
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
                    {locations.map((loc, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{loc.warehouse}</TableCell>
                        <TableCell>{loc.zone}</TableCell>
                        <TableCell className="text-right font-medium">{loc.quantity}</TableCell>
                      </TableRow>
                    ))}
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
                    {stockHistory.map((move) => (
                      <TableRow key={move.id}>
                        <TableCell className="text-sm">{move.date}</TableCell>
                        <TableCell className="font-medium">{move.reference}</TableCell>
                        <TableCell className="text-sm">{move.type}</TableCell>
                        <TableCell className={`text-right font-medium ${move.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {move.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">{move.balance}</TableCell>
                      </TableRow>
                    ))}
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
