import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function StockMoveForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      productId: "",
      quantity: 0,
      fromLocation: "",
      toLocation: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Stock move data:", data);
      toast({
        title: "Stock transfer created",
        description: "New stock transfer has been created successfully",
      });
      setLocation("/stock-moves");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create stock transfer",
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
          onClick={() => setLocation("/stock-moves")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Stock Transfer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Move stock between warehouse locations
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select {...form.register("productId")}>
                  <SelectTrigger id="productId" data-testid="select-product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oak">Oak Wood Plank</SelectItem>
                    <SelectItem value="metal">Metal Brackets Set</SelectItem>
                    <SelectItem value="paint">Paint - White Gloss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  data-testid="input-quantity"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromLocation">From Location</Label>
                <Select {...form.register("fromLocation")}>
                  <SelectTrigger id="fromLocation" data-testid="select-from-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wa-z1">Warehouse A - Zone 1</SelectItem>
                    <SelectItem value="wa-z2">Warehouse A - Zone 2</SelectItem>
                    <SelectItem value="wb-z1">Warehouse B - Zone 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toLocation">To Location</Label>
                <Select {...form.register("toLocation")}>
                  <SelectTrigger id="toLocation" data-testid="select-to-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wa-z1">Warehouse A - Zone 1</SelectItem>
                    <SelectItem value="wa-z2">Warehouse A - Zone 2</SelectItem>
                    <SelectItem value="wb-z1">Warehouse B - Zone 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Transfer Date</Label>
                <Input
                  id="date"
                  type="date"
                  data-testid="input-date"
                  {...form.register("date")}
                />
              </div>

              <Button type="submit" disabled={isLoading} data-testid="button-create-transfer">
                {isLoading ? "Creating..." : "Create Transfer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
