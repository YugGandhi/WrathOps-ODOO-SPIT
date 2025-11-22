import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductDetails() {
  const params = useParams();

  const product = {
    id: params.id || "1",
    name: "Steel Bars 20mm",
    sku: "STL-BAR-20",
    category: "Raw Materials",
    unitOfMeasure: "Pieces",
    description: "High-quality steel bars with 20mm diameter, suitable for construction and manufacturing purposes.",
    onHand: 450,
    reserved: 50,
    forecasted: 400,
    minQuantity: 100,
    location: "Main Warehouse - A1",
  };

  const stockHistory = [
    { date: "2024-11-20", reference: "WH/IN/0001", type: "Receipt", quantity: "+100", location: "Main Warehouse" },
    { date: "2024-11-18", reference: "WH/OUT/0045", type: "Delivery", quantity: "-25", location: "Main Warehouse" },
    { date: "2024-11-15", reference: "WH/ADJ/0012", type: "Adjustment", quantity: "+10", location: "Main Warehouse" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-foreground">{product.name}</h1>
          <p className="text-muted-foreground mt-1">SKU: {product.sku}</p>
        </div>
        <Button variant="outline" data-testid="button-edit">
          Edit Product
        </Button>
        <Button data-testid="button-adjust-stock">
          Adjust Quantity
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hand</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.onHand}</div>
            <p className="text-xs text-muted-foreground mt-1">{product.unitOfMeasure}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.reserved}</div>
            <p className="text-xs text-muted-foreground mt-1">Allocated to orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.forecasted}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="locations" data-testid="tab-locations">Locations</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                  <p className="text-base font-medium mt-1">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU / Code</p>
                  <p className="text-base font-mono mt-1">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge variant="outline" className="mt-1">{product.category}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit of Measure</p>
                  <p className="text-base mt-1">{product.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Minimum Quantity</p>
                  <p className="text-base mt-1">{product.minQuantity} {product.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Primary Location</p>
                  <p className="text-base mt-1">{product.location}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base mt-1">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Main Warehouse</TableCell>
                    <TableCell className="font-mono">Zone A - Shelf 1</TableCell>
                    <TableCell className="text-right font-semibold">300</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Main Warehouse</TableCell>
                    <TableCell className="font-mono">Zone A - Shelf 2</TableCell>
                    <TableCell className="text-right font-semibold">150</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{item.date}</TableCell>
                      <TableCell className="font-mono text-sm">{item.reference}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className={`text-right font-semibold ${item.quantity.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
