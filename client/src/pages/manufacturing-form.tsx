import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Component {
  id: string;
  componentName: string;
  requiredQuantity: number;
  unitOfMeasure: string;
}

interface Operation {
  id: string;
  name: string;
  sequence: number;
}

export default function ManufacturingForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [components, setComponents] = useState<Component[]>([
    { id: "1", componentName: "", requiredQuantity: 0, unitOfMeasure: "pieces" }
  ]);
  const [operations, setOperations] = useState<Operation[]>([
    { id: "1", name: "", sequence: 1 }
  ]);

  const form = useForm({
    defaultValues: {
      reference: "",
      contact: "",
      scheduleDate: new Date().toISOString().split('T')[0],
      status: "Draft",
      quantity: 0,
      unitOfMeasure: "pieces",
      productId: "",
    },
  });

  const addComponent = () => {
    setComponents([
      ...components,
      { id: String(Date.now()), componentName: "", requiredQuantity: 0, unitOfMeasure: "pieces" }
    ]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(item => item.id !== id));
  };

  const updateComponent = (id: string, field: keyof Component, value: any) => {
    setComponents(components.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addOperation = () => {
    const nextSequence = Math.max(...operations.map(o => o.sequence), 0) + 1;
    setOperations([
      ...operations,
      { id: String(Date.now()), name: "", sequence: nextSequence }
    ]);
  };

  const removeOperation = (id: string) => {
    setOperations(operations.filter(item => item.id !== id));
  };

  const updateOperation = (id: string, field: keyof Operation, value: any) => {
    setOperations(operations.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Manufacturing order data:", { ...data, components, operations });
      toast({
        title: "Manufacturing order created",
        description: "New manufacturing order has been created successfully",
      });
      setLocation("/manufacturing");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create manufacturing order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/manufacturing")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Manufacturing Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new manufacturing order with components and operations
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference *</Label>
                <Input
                  id="reference"
                  data-testid="input-reference"
                  placeholder="e.g., WH/MO/0001"
                  {...form.register("reference")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  data-testid="input-contact"
                  placeholder="e.g., Internal Production"
                  {...form.register("contact")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduleDate">Schedule Date *</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  data-testid="input-schedule-date"
                  {...form.register("scheduleDate")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select {...form.register("status")}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  data-testid="input-quantity"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                <Select {...form.register("unitOfMeasure")}>
                  <SelectTrigger id="unitOfMeasure" data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Components</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addComponent}
                data-testid="button-add-component"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Component
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {components.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No components added yet</p>
            ) : (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component Name</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-center w-10">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {components.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.componentName}
                              onChange={(e) => updateComponent(item.id, "componentName", e.target.value)}
                              placeholder="Component name"
                              data-testid={`input-component-name-${index}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.requiredQuantity}
                              onChange={(e) => updateComponent(item.id, "requiredQuantity", parseInt(e.target.value) || 0)}
                              className="w-24 text-right"
                              data-testid={`input-component-qty-${index}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.unitOfMeasure}
                              onValueChange={(value) => updateComponent(item.id, "unitOfMeasure", value)}
                            >
                              <SelectTrigger className="w-32" data-testid={`select-component-unit-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="liters">Liters</SelectItem>
                                <SelectItem value="meters">Meters</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeComponent(item.id)}
                              data-testid={`button-remove-component-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Operations</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOperation}
                data-testid="button-add-operation"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Operation
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {operations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No operations added yet</p>
            ) : (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation Name</TableHead>
                        <TableHead className="text-right">Sequence</TableHead>
                        <TableHead className="text-center w-10">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operations.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateOperation(item.id, "name", e.target.value)}
                              placeholder="e.g., Wood Cutting"
                              data-testid={`input-operation-name-${index}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.sequence}
                              onChange={(e) => updateOperation(item.id, "sequence", parseInt(e.target.value) || 1)}
                              className="w-20 text-right"
                              data-testid={`input-operation-sequence-${index}`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeOperation(item.id)}
                              data-testid={`button-remove-operation-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-create-mo"
          >
            {isLoading ? "Creating..." : "Create Manufacturing Order"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/manufacturing")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
