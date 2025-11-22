import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  description: z.string().optional(),
  initialStock: z.string().optional(),
  minimumQuantity: z.string().optional(),
  preferredSupplier: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const [match] = useRoute("/inventory/:id/edit");
  const isEdit = !!match;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unitOfMeasure: "",
      description: "",
      initialStock: "0",
      minimumQuantity: "0",
      preferredSupplier: "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log("Product form data:", data);
      toast({
        title: isEdit ? "Product updated" : "Product created",
        description: isEdit ? "Product has been updated successfully" : "New product has been added to inventory",
      });
      setLocation("/inventory");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
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
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit ? "Update product information" : "Create a new product in inventory"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  data-testid="input-product-name"
                  {...form.register("name")}
                  className={form.formState.errors.name ? "border-destructive" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Code *</Label>
                <Input
                  id="sku"
                  data-testid="input-sku"
                  {...form.register("sku")}
                  className={form.formState.errors.sku ? "border-destructive" : ""}
                />
                {form.formState.errors.sku && (
                  <p className="text-xs text-destructive">{form.formState.errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                <Select onValueChange={(value) => form.setValue("unitOfMeasure", value)}>
                  <SelectTrigger data-testid="select-unit">
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
                {form.formState.errors.unitOfMeasure && (
                  <p className="text-xs text-destructive">{form.formState.errors.unitOfMeasure.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                data-testid="input-description"
                rows={3}
                {...form.register("description")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stock & Reordering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="initialStock">Initial Stock Quantity</Label>
                  <Input
                    id="initialStock"
                    type="number"
                    data-testid="input-initial-stock"
                    {...form.register("initialStock")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                <Input
                  id="minimumQuantity"
                  type="number"
                  data-testid="input-minimum-quantity"
                  {...form.register("minimumQuantity")}
                />
                <p className="text-xs text-muted-foreground">
                  Reorder alert will trigger when stock falls below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredSupplier">Preferred Supplier</Label>
                <Input
                  id="preferredSupplier"
                  data-testid="input-preferred-supplier"
                  {...form.register("preferredSupplier")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            data-testid="button-save-product"
          >
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/inventory")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
