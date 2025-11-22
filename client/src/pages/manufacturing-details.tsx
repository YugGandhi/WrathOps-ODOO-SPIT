import { ArrowLeft, Play, Pause, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

export default function ManufacturingDetails() {
  const params = useParams();

  const order = {
    id: params.id || "1",
    reference: "WH/MO/0001",
    contact: "ABC Manufacturing",
    scheduleDate: "2024-11-25",
    quantity: 100,
    unitOfMeasure: "Units",
    status: "ready" as const,
  };

  const components = [
    { name: "Steel Bars 20mm", required: 200, available: 450, unit: "Pieces" },
    { name: "Wooden Planks Oak", required: 50, available: 120, unit: "Pieces" },
    { name: "Industrial Screws M8", required: 400, available: 15, unit: "Pieces" },
  ];

  const operations = [
    { id: "1", name: "Wood Cutting", status: "done" as const },
    { id: "2", name: "Steel Fabrication", status: "in_progress" as const },
    { id: "3", name: "Assembly", status: "pending" as const },
    { id: "4", name: "Quality Inspection", status: "pending" as const },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/manufacturing">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-foreground">{order.reference}</h1>
          <p className="text-muted-foreground mt-1">{order.contact}</p>
        </div>
        <StatusBadge status={order.status} />
        <Button data-testid="button-validate">
          Validate Order
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operations</TabsTrigger>
          <TabsTrigger value="misc" data-testid="tab-misc">Misc</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference</p>
                  <p className="text-base font-mono mt-1">{order.reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p className="text-base mt-1">{order.contact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Schedule Date</p>
                  <p className="text-base font-mono mt-1">{order.scheduleDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="text-base font-semibold mt-1">{order.quantity} {order.unitOfMeasure}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Required Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component Name</TableHead>
                    <TableHead className="text-right">Required</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell className="text-right font-semibold">{component.required}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        component.available >= component.required 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {component.available}
                      </TableCell>
                      <TableCell>{component.unit}</TableCell>
                      <TableCell>
                        {component.available >= component.required ? (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-700 dark:text-emerald-400">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Insufficient
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {operations.map((operation) => (
                <Card key={operation.id} className="overflow-visible">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{operation.name}</p>
                        <div className="mt-1">
                          <StatusBadge status={operation.status} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {operation.status === "pending" && (
                          <Button size="sm" className="gap-2" data-testid={`button-start-${operation.id}`}>
                            <Play className="h-4 w-4" />
                            Start
                          </Button>
                        )}
                        {operation.status === "in_progress" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-2" data-testid={`button-pause-${operation.id}`}>
                              <Pause className="h-4 w-4" />
                              Pause
                            </Button>
                            <Button size="sm" className="gap-2" data-testid={`button-done-${operation.id}`}>
                              <CheckCircle2 className="h-4 w-4" />
                              Done
                            </Button>
                          </>
                        )}
                        {operation.status === "done" && (
                          <Button size="sm" disabled className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="misc">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No additional information available for this order.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
