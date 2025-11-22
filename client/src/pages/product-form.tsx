import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  description: z.string().optional(),
  minimumQuantity: z.string().optional(),
  preferredSupplier: z.string().optional(),
  locationId: z.string().optional(),
  pricePerUnit: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const [, setLocation] = useLocation();
  const [matchNew, paramsNew] = useRoute("/inventory/new");
  const [matchEdit, paramsEdit] = useRoute("/inventory/:id/edit");
  
  const isAddMode = !!matchNew;
  const isEditMode = !!matchEdit;
  const productId = paramsEdit?.id;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [originalProduct, setOriginalProduct] = useState<any | null>(null);

  // Fetch products (for edit mode product selection)
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        console.log("Fetched products:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Products fetch error:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/locations");
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        console.error("Locations fetch error:", error);
        return [];
      }
    },
  });

  // Fetch contacts for preferred supplier
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/contacts?type=Vendor");
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        console.error("Contacts fetch error:", error);
        return [];
      }
    },
  });

  // Fetch product if editing by ID
  const { data: productToEdit } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!isEditMode && !!productId,
  });

  // Sort products alphabetically by name
  const sortedProducts = [...products].sort((a: any, b: any) => 
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
      locationId: "",
      pricePerUnit: "0",
    },
  });

  // Load product when editing by ID
  useEffect(() => {
    if (isEditMode && productToEdit) {
      setOriginalProduct({ ...productToEdit });
      form.reset({
        name: productToEdit.name || "",
        sku: productToEdit.sku || "",
        category: productToEdit.category || "",
        unitOfMeasure: productToEdit.unitOfMeasure || "",
        description: productToEdit.description || "",
        minimumQuantity: String(productToEdit.minimumQuantity || 0),
        preferredSupplier: productToEdit.preferredSupplier || "",
        locationId: productToEdit.locationId || "",
        pricePerUnit: productToEdit.pricePerUnit || "0",
      });
    }
  }, [isEditMode, productToEdit, form]);

  // Load product when selected from dropdown (legacy edit mode)
  useEffect(() => {
    if (selectedProductId && products.length > 0 && !isEditMode && !isAddMode) {
      const product = products.find((p: any) => p.id === selectedProductId);
      if (product) {
        setOriginalProduct({ ...product });
        form.reset({
          name: product.name,
          sku: product.sku,
          category: product.category,
          unitOfMeasure: product.unitOfMeasure,
          description: product.description || "",
          minimumQuantity: String(product.minimumQuantity || 0),
          preferredSupplier: product.preferredSupplier || "",
          locationId: product.locationId || "",
          pricePerUnit: product.pricePerUnit || "0",
        });
      }
    } else if (!selectedProductId && !isEditMode && !isAddMode) {
      setOriginalProduct(null);
      form.reset({
        name: "",
        sku: "",
        category: "",
        unitOfMeasure: "",
        description: "",
        minimumQuantity: "0",
        preferredSupplier: "",
        locationId: "",
        pricePerUnit: "0",
      });
    }
  }, [selectedProductId, products, form, isEditMode, isAddMode]);

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitOfMeasure: data.unitOfMeasure,
          description: data.description,
          minimumQuantity: parseInt(data.minimumQuantity || "0"),
          preferredSupplier: data.preferredSupplier || null,
          locationId: data.locationId || null,
          pricePerUnit: data.pricePerUnit || "0",
          onHandQuantity: 0,
          reservedQuantity: 0,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setLocation("/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitOfMeasure: data.unitOfMeasure,
          description: data.description,
          minimumQuantity: parseInt(data.minimumQuantity || "0"),
          preferredSupplier: data.preferredSupplier || null,
          locationId: data.locationId || null,
          pricePerUnit: data.pricePerUnit || "0",
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setLocation("/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (isAddMode) {
      createProduct.mutate(data);
    } else if (isEditMode && productId) {
      updateProduct.mutate({ id: productId, data });
    } else if (selectedProductId) {
      updateProduct.mutate({ id: selectedProductId, data });
    } else {
      toast({
        title: "No product selected",
        description: "Please select a product to edit",
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
  const canSubmit = isAddMode || isEditMode || selectedProductId;

  // Function to scroll to and focus a field
  const scrollToField = (fieldId: string) => {
    if (fieldId === "category" || fieldId === "unitOfMeasure" || fieldId === "locationId") {
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
      const element = document.getElementById(fieldId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          element.focus();
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            element.select();
          }
        }, 300);
      }
    }
  };

  if (productsLoading && !isAddMode) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

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
            {isAddMode ? "Add Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAddMode 
              ? "Create a new product in your inventory"
              : isEditMode
              ? "Update product information"
              : "Select a product to update its information"}
          </p>
        </div>
      </div>

      {/* Product Selection Card - only show in legacy edit mode */}
      {!isAddMode && !isEditMode && (
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
      )}

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
                  disabled={!canSubmit}
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
                  disabled={!canSubmit || isEditMode}
                  className={form.formState.errors.sku ? "border-destructive" : ""}
                />
                {form.formState.errors.sku && (
                  <p className="text-xs text-destructive">{form.formState.errors.sku.message}</p>
                )}
                {isEditMode && (
                  <p className="text-xs text-muted-foreground">SKU cannot be changed</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                  disabled={!canSubmit}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Finishing">Finishing</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
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
                  disabled={!canSubmit}
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pieces">Pieces</SelectItem>
                    <SelectItem value="Sheets">Sheets</SelectItem>
                    <SelectItem value="Boxes">Boxes</SelectItem>
                    <SelectItem value="Gallons">Gallons</SelectItem>
                    <SelectItem value="Quarts">Quarts</SelectItem>
                    <SelectItem value="Kilograms">Kilograms</SelectItem>
                    <SelectItem value="Liters">Liters</SelectItem>
                    <SelectItem value="Meters">Meters</SelectItem>
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
                disabled={!canSubmit}
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
                  min="0"
                  data-testid="input-minimum-quantity"
                  {...form.register("minimumQuantity")}
                  disabled={!canSubmit}
                />
                <p className="text-xs text-muted-foreground">
                  Reorder alert will trigger when stock falls below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price per Unit</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  data-testid="input-price-per-unit"
                  {...form.register("pricePerUnit")}
                  disabled={!canSubmit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <Select 
                  value={form.watch("locationId")}
                  onValueChange={(value) => form.setValue("locationId", value)}
                  disabled={!canSubmit}
                >
                  <SelectTrigger data-testid="select-locationId">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.shortcode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredSupplier">Preferred Supplier</Label>
                <Select
                  value={form.watch("preferredSupplier")}
                  onValueChange={(value) => form.setValue("preferredSupplier", value)}
                  disabled={!canSubmit}
                >
                  <SelectTrigger data-testid="select-preferred-supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact: any) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            data-testid="button-save-product"
            disabled={!canSubmit || createProduct.isPending || updateProduct.isPending}
          >
            {createProduct.isPending || updateProduct.isPending
              ? "Saving..."
              : isAddMode
              ? "Add Product"
              : "Update Product"}
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

      {/* Before & After Comparison - only show in edit mode */}
      {originalProduct && (isEditMode || selectedProductId) && (
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
                    <TableCell className={originalProduct.category !== currentValues.category ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.category || "-"}
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
                    <TableCell className={String(originalProduct.minimumQuantity || "0") !== currentValues.minimumQuantity ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.minimumQuantity || "0"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("pricePerUnit")}
                  >
                    <TableCell className="font-medium">Price per Unit</TableCell>
                    <TableCell>${parseFloat(originalProduct.pricePerUnit || "0").toFixed(2)}</TableCell>
                    <TableCell className={originalProduct.pricePerUnit !== currentValues.pricePerUnit ? "bg-blue-50 font-medium" : ""}>
                      ${parseFloat(currentValues.pricePerUnit || "0").toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("locationId")}
                  >
                    <TableCell className="font-medium">Location</TableCell>
                    <TableCell>
                      {originalProduct.locationId 
                        ? locations.find((l: any) => l.id === originalProduct.locationId)?.name || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell className={originalProduct.locationId !== currentValues.locationId ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.locationId 
                        ? locations.find((l: any) => l.id === currentValues.locationId)?.name || "N/A"
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToField("preferredSupplier")}
                  >
                    <TableCell className="font-medium">Preferred Supplier</TableCell>
                    <TableCell>
                      {originalProduct.preferredSupplier 
                        ? contacts.find((c: any) => c.id === originalProduct.preferredSupplier)?.name || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell className={originalProduct.preferredSupplier !== currentValues.preferredSupplier ? "bg-blue-50 font-medium" : ""}>
                      {currentValues.preferredSupplier 
                        ? contacts.find((c: any) => c.id === currentValues.preferredSupplier)?.name || "N/A"
                        : "N/A"}
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
