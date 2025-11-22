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
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Play, Pause } from "lucide-react";

// Mock data
const manufacturingOrder = {
  id: "1",
  reference: "WH/MO/0001",
  contact: "Internal Production",
  scheduleDate: "2024-01-20",
  status: "In Progress",
  quantity: 50,
  unitOfMeasure: "pieces",
};

const components = [
  {
    id: "1",
    name: "Oak Wood Plank",
    required: 100,
    available: 450,
    unit: "pieces",
  },
  {
    id: "2",
    name: "Metal Brackets Set",
    required: 50,
    available: 1200,
    unit: "sets",
  },
  {
    id: "3",
    name: "Screws Box",
    required: 5,
    available: 85,
    unit: "boxes",
  },
];

const operations = [
  {
    id: "1",
    name: "Wood Cutting",
    status: "Done",
    sequence: 1,
  },
  {
    id: "2",
    name: "Assembly",
    status: "In Progress",
    sequence: 2,
  },
  {
    id: "3",
    name: "Inspection",
    status: "Pending",
    sequence: 3,
  },
];

const statusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Paused: "bg-yellow-100 text-yellow-800",
  Done: "bg-green-100 text-green-800",
};

export default function ManufacturingDetails() {
  const [match] = useRoute("/manufacturing/:id");
  const [, setLocation] = useLocation();

  const completedOps = operations.filter(op => op.status === "Done").length;
  const progress = (completedOps / operations.length) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/manufacturing")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-mo-reference">
              {manufacturingOrder.reference}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {manufacturingOrder.contact}
            </p>
          </div>
        </div>
        <Button data-testid="button-validate-mo">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Validate Order
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operations</TabsTrigger>
          <TabsTrigger value="misc" data-testid="tab-misc">Misc</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="text-sm font-medium">{manufacturingOrder.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={statusColors[manufacturingOrder.status]}>
                    {manufacturingOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Schedule Date</p>
                  <p className="text-sm font-medium">{manufacturingOrder.scheduleDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-sm font-medium">
                    {manufacturingOrder.quantity} {manufacturingOrder.unitOfMeasure}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Production Progress</p>
                  <p className="text-sm font-medium">{Math.round(progress)}%</p>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Required Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component Name</TableHead>
                      <TableHead className="text-right">Required</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.map((component) => (
                      <TableRow key={component.id} data-testid={`row-component-${component.id}`}>
                        <TableCell className="font-medium">{component.name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {component.required}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={component.available >= component.required ? "text-green-600" : "text-red-600"}>
                            {component.available}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {component.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Production Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {operations.map((operation) => (
                <Card key={operation.id} data-testid={`card-operation-${operation.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {operation.sequence}
                        </div>
                        <div>
                          <p className="font-medium">{operation.name}</p>
                          <Badge variant="secondary" className={`${statusColors[operation.status]} mt-1`}>
                            {operation.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {operation.status === "Pending" && (
                          <Button size="sm" data-testid={`button-start-${operation.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        )}
                        {operation.status === "In Progress" && (
                          <>
                            <Button size="sm" variant="outline" data-testid={`button-pause-${operation.id}`}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                            <Button size="sm" data-testid={`button-done-${operation.id}`}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Done
                            </Button>
                          </>
                        )}
                        {operation.status === "Done" && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
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
              <CardTitle className="text-base font-semibold">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No additional information available for this manufacturing order.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
