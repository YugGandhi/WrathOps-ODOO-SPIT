import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock products data - same as inventory page
const mockProducts = [
  {
    id: "1",
    name: "Oak Wood Plank",
    sku: "OWP-001",
    category: "Raw Materials",
    unitOfMeasure: "pieces",
    description: "High-quality oak wood planks for furniture manufacturing",
    minimumQuantity: "50",
    preferredSupplier: "Timber Supply Co.",
    pricePerUnit: 12.50,
    onHand: 450,
    reserved: 120,
    location: "Warehouse A - Zone 1",
  },
  {
    id: "2",
    name: "Metal Brackets Set",
    sku: "MBS-045",
    category: "Hardware",
    unitOfMeasure: "pieces",
    description: "Heavy-duty metal brackets for structural support",
    minimumQuantity: "100",
    preferredSupplier: "Hardware Solutions Inc.",
    pricePerUnit: 8.75,
    onHand: 1200,
    reserved: 300,
    location: "Warehouse A - Zone 2",
  },
  {
    id: "3",
    name: "Paint - White Gloss",
    sku: "PNT-WG-5L",
    category: "Finishing",
    unitOfMeasure: "liters",
    description: "Premium white gloss paint, 5L containers",
    minimumQuantity: "10",
    preferredSupplier: "Paint Masters Ltd.",
    pricePerUnit: 45.00,
    onHand: 15,
    reserved: 10,
    location: "Warehouse B - Zone 1",
  },
  {
    id: "4",
    name: "Pine Wood Board",
    sku: "PWB-002",
    category: "Raw Materials",
    unitOfMeasure: "pieces",
    description: "Standard pine wood boards",
    minimumQuantity: "20",
    preferredSupplier: "Timber Supply Co.",
    pricePerUnit: 9.25,
    onHand: 5,
    reserved: 0,
    location: "Warehouse A - Zone 1",
  },
  {
    id: "5",
    name: "Screws Box (1000 pcs)",
    sku: "SCR-1000",
    category: "Hardware",
    unitOfMeasure: "boxes",
    description: "Assorted screws, 1000 pieces per box",
    minimumQuantity: "25",
    preferredSupplier: "Hardware Solutions Inc.",
    pricePerUnit: 15.99,
    onHand: 85,
    reserved: 25,
    location: "Warehouse A - Zone 2",
  },
];

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  description: z.string().optional(),
  minimumQuantity: z.string().optional(),
  preferredSupplier: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type Product = typeof mockProducts[0];

export default function ProductForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  // Sort products alphabetically by name
  const sortedProducts = [...mockProducts].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unitOfMeasure: "",
      description: "",
      minimumQuantity: "0",
      preferredSupplier: "",
    },
  });

  // Load product when selected
  useEffect(() => {
    if (selectedProductId) {
      const product = mockProducts.find(p => p.id === selectedProductId);
      if (product) {
        setOriginalProduct({ ...product });
        form.reset({
          name: product.name,
          sku: product.sku,
          category: product.category,
          unitOfMeasure: product.unitOfMeasure,
          description: product.description || "",
          minimumQuantity: product.minimumQuantity || "0",
          preferredSupplier: product.preferredSupplier || "",
        });
      }
    } else {
      setOriginalProduct(null);
      form.reset({
        name: "",
        sku: "",
        category: "",
        unitOfMeasure: "",
        description: "",
        minimumQuantity: "0",
        preferredSupplier: "",
      });
    }
  }, [selectedProductId, form]);

  const onSubmit = async (data: ProductFormData) => {
    if (!selectedProductId) {
      toast({
        title: "No product selected",
        description: "Please select a product to edit",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Product form data:", data);
      console.log("Original product:", originalProduct);
      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
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

  const getCategoryValue = (category: string) => {
    const categoryMap: Record<string, string> = {
      "Raw Materials": "raw-materials",
      "Hardware": "hardware",
      "Finishing": "finishing",
      "Packaging": "packaging",
    };
    return categoryMap[category] || category.toLowerCase().replace(/\s+/g, "-");
  };

  const getCategoryLabel = (value: string) => {
    const categoryMap: Record<string, string> = {
      "raw-materials": "Raw Materials",
      "hardware": "Hardware",
      "finishing": "Finishing",
      "packaging": "Packaging",
    };
    return categoryMap[value] || value;
  };

  const currentValues = form.watch();

  // Function to scroll to and focus a field
  const scrollToField = (fieldId: string) => {
    // For select fields, find the select trigger button
    if (fieldId === "category" || fieldId === "unitOfMeasure") {
      const selectElement = document.querySelector(`[data-testid="select-${fieldId}"]`);
      if (selectElement) {
        selectElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const button = selectElement.querySelector('button');
          if (button) {
            button.focus();
            button.click();
          }
        }, 300);
      }
    } else {
      // For regular input fields
      const element = document.getElementById(fieldId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          element.focus();
          // For text inputs, select the text if it's not empty
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            element.select();
          }
        }, 300);
      }
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
            Edit Product
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a product to update its information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Select Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="product-select">Search by name or SKU *</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger id="product-select" data-testid="select-product">
                <SelectValue placeholder="Select a product to edit..." />
              </SelectTrigger>
              <SelectContent>
                {sortedProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Products are sorted alphabetically by name
            </p>
          </div>
        </CardContent>
      </Card>

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
                  disabled={!selectedProductId}
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
                  disabled={!selectedProductId}
                  className={form.formState.errors.sku ? "border-destructive" : ""}
                />
                {form.formState.errors.sku && (
                  <p className="text-xs text-destructive">{form.formState.errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                  disabled={!selectedProductId}
                >
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
                <Select 
                  value={form.watch("unitOfMeasure")}
                  onValueChange={(value) => form.setValue("unitOfMeasure", value)}
                  disabled={!selectedProductId}
                >
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
                disabled={!selectedProductId}
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
              <div className="space-y-2">
                <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                <Input
                  id="minimumQuantity"
                  type="number"
                  data-testid="input-minimum-quantity"
                  {...form.register("minimumQuantity")}
                  disabled={!selectedProductId}
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
                  disabled={!selectedProductId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            data-testid="button-save-product"
            disabled={!selectedProductId}
          >
            Update Product
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

      {originalProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Before & After Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("name")}
                  >
                    <TableCell className="font-medium">Product Name</TableCell>
                    <TableCell>{originalProduct.name}</TableCell>
                    <TableCell className={currentValues.name !== originalProduct.name ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("sku")}
                  >
                    <TableCell className="font-medium">SKU</TableCell>
                    <TableCell>{originalProduct.sku}</TableCell>
                    <TableCell className={currentValues.sku !== originalProduct.sku ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.sku || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("category")}
                  >
                    <TableCell className="font-medium">Category</TableCell>
                    <TableCell>{originalProduct.category}</TableCell>
                    <TableCell className={getCategoryValue(originalProduct.category) !== currentValues.category ? "bg-blue-50 font-medium" : ""}>
                      {getCategoryLabel(currentValues.category) || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("unitOfMeasure")}
                  >
                    <TableCell className="font-medium">Unit of Measure</TableCell>
                    <TableCell>{originalProduct.unitOfMeasure}</TableCell>
                    <TableCell className={originalProduct.unitOfMeasure !== currentValues.unitOfMeasure ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.unitOfMeasure || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("description")}
                  >
                    <TableCell className="font-medium">Description</TableCell>
                    <TableCell>{originalProduct.description || "-"}</TableCell>
                    <TableCell className={originalProduct.description !== currentValues.description ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.description || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("minimumQuantity")}
                  >
                    <TableCell className="font-medium">Minimum Quantity</TableCell>
                    <TableCell>{originalProduct.minimumQuantity || "0"}</TableCell>
                    <TableCell className={originalProduct.minimumQuantity !== currentValues.minimumQuantity ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.minimumQuantity || "0"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("preferredSupplier")}
                  >
                    <TableCell className="font-medium">Preferred Supplier</TableCell>
                    <TableCell>{originalProduct.preferredSupplier || "-"}</TableCell>
                    <TableCell className={originalProduct.preferredSupplier !== currentValues.preferredSupplier ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.preferredSupplier || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Click on any row to jump to and edit that field
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
