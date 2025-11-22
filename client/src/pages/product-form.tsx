import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";

export default function ProductForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const isEdit = !!params.id;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitOfMeasure: "",
    initialStock: "0",
    minQuantity: "0",
    location: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        unitOfMeasure: formData.unitOfMeasure,
        onHandQuantity: parseInt(formData.initialStock) || 0,
        reservedQuantity: 0,
        forecastedQuantity: parseInt(formData.initialStock) || 0,
        minQuantity: parseInt(formData.minQuantity) || 0,
        location: formData.location,
        description: formData.description || undefined,
      });
      
      toast({
        title: "Product created",
        description: "New product has been added to inventory.",
      });
      
      setLocation("/inventory");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update product information" : "Create a new product in your inventory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Code *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Enter SKU code"
                  required
                  data-testid="input-sku"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw Materials</SelectItem>
                    <SelectItem value="components">Components</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="finished">Finished Goods</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                <Select 
                  value={formData.unitOfMeasure} 
                  onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
                >
                  <SelectTrigger id="unitOfMeasure" data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialStock">Initial Stock</Label>
                <Input
                  id="initialStock"
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                  placeholder="0"
                  data-testid="input-initial-stock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuantity">Minimum Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  placeholder="0"
                  data-testid="input-min-quantity"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Primary Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Warehouse - A1"
                  data-testid="input-location"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                  data-testid="input-description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/inventory">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createProduct.isPending} data-testid="button-save">
                {createProduct.isPending ? "Saving..." : (isEdit ? "Update Product" : "Create Product")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
