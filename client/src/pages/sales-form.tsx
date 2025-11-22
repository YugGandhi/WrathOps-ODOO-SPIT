import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface LineItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function SalesOrderForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", productId: "", quantity: 0, unitPrice: 0 }
  ]);

  const form = useForm({
    defaultValues: {
      customerId: "",
      orderDate: new Date().toISOString().split('T')[0],
      total: "0.00",
    },
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), productId: "", quantity: 0, unitPrice: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Sales order data:", { ...data, lineItems });
      toast({
        title: "Sales order created",
        description: "New sales order has been created successfully",
      });
      setLocation("/sales");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sales order",
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
          onClick={() => setLocation("/sales")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Sales Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new sales order with line items
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select {...form.register("customerId")}>
                  <SelectTrigger id="customerId" data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abc">ABC Corporation</SelectItem>
                    <SelectItem value="xyz">XYZ Limited</SelectItem>
                    <SelectItem value="global">Global Traders Inc.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  type="date"
                  data-testid="input-order-date"
                  {...form.register("orderDate")}
                />
              </div>

              <Button type="submit" disabled={isLoading} data-testid="button-create-so">
                {isLoading ? "Creating..." : "Create Sales Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
