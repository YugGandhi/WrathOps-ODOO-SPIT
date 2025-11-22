import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warehouseForm, setWarehouseForm] = useState({ name: "", shortcode: "", address: "" });
  const [locationForm, setLocationForm] = useState({ name: "", shortcode: "", warehouseId: "" });

  // Fetch warehouses
  const { data: warehouses = [], isLoading: warehousesLoading, error: warehousesError } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/warehouses");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
          console.error("Warehouses fetch error:", errorData);
          throw new Error(errorData.error || `Failed to fetch warehouses: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched warehouses:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Warehouses fetch exception:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/locations");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
          console.error("Locations fetch error:", errorData);
          throw new Error(errorData.error || `Failed to fetch locations: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched locations:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Locations fetch exception:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Create warehouse mutation
  const createWarehouse = useMutation({
    mutationFn: async (data: { name: string; shortcode: string; address?: string }) => {
      const response = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create warehouse");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({
        title: "Success",
        description: "Warehouse added successfully",
      });
      setWarehouseForm({ name: "", shortcode: "", address: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete warehouse mutation
  const deleteWarehouse = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/warehouses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete warehouse");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: "Warehouse deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete warehouse",
        variant: "destructive",
      });
    },
  });

  // Create location mutation
  const createLocation = useMutation({
    mutationFn: async (data: { name: string; shortcode: string; warehouseId: string; description?: string }) => {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create location");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: "Location added successfully",
      });
      setLocationForm({ name: "", shortcode: "", warehouseId: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete location mutation
  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete location");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const handleAddWarehouse = () => {
    if (!warehouseForm.name || !warehouseForm.shortcode) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createWarehouse.mutate(warehouseForm);
  };

  const handleDeleteWarehouse = (id: string) => {
    if (confirm("Are you sure you want to delete this warehouse? This will also delete all locations in this warehouse.")) {
      deleteWarehouse.mutate(id);
    }
  };

  const handleAddLocation = () => {
    if (!locationForm.name || !locationForm.shortcode || !locationForm.warehouseId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createLocation.mutate(locationForm);
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocation.mutate(id);
    }
  };

  // Create maps for quick lookups
  const warehousesMap = warehouses.reduce((acc: Record<string, any>, w: any) => {
    acc[w.id] = w;
    return acc;
  }, {});

  const locationsByWarehouse = locations.reduce((acc: Record<string, any[]>, loc: any) => {
    if (!acc[loc.warehouseId]) acc[loc.warehouseId] = [];
    acc[loc.warehouseId].push(loc);
    return acc;
  }, {});

  if (warehousesLoading || locationsLoading) {
    return (
      <div className="p-6">
        <p>Loading warehouses and locations...</p>
      </div>
    );
  }

  if (warehousesError || locationsError) {
    return (
      <div className="p-6">
        <div className="text-destructive space-y-2">
          <p className="font-semibold">Error loading data:</p>
          {warehousesError && <p>Warehouses: {warehousesError instanceof Error ? warehousesError.message : "Unknown error"}</p>}
          {locationsError && <p>Locations: {locationsError instanceof Error ? locationsError.message : "Unknown error"}</p>}
          <Button onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            queryClient.invalidateQueries({ queryKey: ["locations"] });
          }} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This page contains the warehouse details & location.
        </p>
      </div>

      {/* Debug info - remove in production */}
      {(warehousesError || locationsError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-destructive">Debug Information:</p>
              {warehousesError && (
                <p>Warehouses Error: {warehousesError instanceof Error ? warehousesError.message : String(warehousesError)}</p>
              )}
              {locationsError && (
                <p>Locations Error: {locationsError instanceof Error ? locationsError.message : String(locationsError)}</p>
              )}
              <p>Warehouses Count: {warehouses.length}</p>
              <p>Locations Count: {locations.length}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Warehouse & Location Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="warehouse" className="space-y-4">
            <TabsList>
              <TabsTrigger value="warehouse" data-testid="tab-warehouse">
                1. Warehouse
              </TabsTrigger>
              <TabsTrigger value="location" data-testid="tab-location">
                2. Locations
              </TabsTrigger>
            </TabsList>

            {/* Warehouse Tab */}
            <TabsContent value="warehouse" className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border space-y-4" data-testid="warehouse-form">
                <h3 className="font-semibold text-lg">Warehouse</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wh-name">Name:</Label>
                    <Input
                      id="wh-name"
                      placeholder="Warehouse name"
                      value={warehouseForm.name}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                      data-testid="input-warehouse-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wh-code">Short Code:</Label>
                    <Input
                      id="wh-code"
                      placeholder="e.g., MW"
                      value={warehouseForm.shortcode}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, shortcode: e.target.value })}
                      data-testid="input-warehouse-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wh-address">Address:</Label>
                    <Input
                      id="wh-address"
                      placeholder="Warehouse address (optional)"
                      value={warehouseForm.address}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                      data-testid="input-warehouse-address"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddWarehouse}
                  className="w-full md:w-auto"
                  disabled={createWarehouse.isPending}
                  data-testid="button-add-warehouse"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createWarehouse.isPending ? "Adding..." : "Add Warehouse"}
                </Button>
              </div>

              {/* Warehouse Hierarchy */}
              <div className="space-y-3" data-testid="warehouse-hierarchy">
                {warehouses.map((warehouse: any) => (
                  <Card key={warehouse.id} data-testid={`card-warehouse-${warehouse.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{warehouse.name}</CardTitle>
                          {warehouse.address && (
                            <p className="text-sm text-muted-foreground mt-1">{warehouse.address}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {warehouse.shortcode}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWarehouse(warehouse.id)}
                            disabled={deleteWarehouse.isPending}
                            data-testid={`button-delete-warehouse-${warehouse.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Locations:</p>
                        <div className="space-y-1 ml-4">
                          {locationsByWarehouse[warehouse.id]?.map((location: any) => (
                            <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded" data-testid={`location-in-warehouse-${location.id}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">→</span>
                                <span className="text-sm font-medium">{location.name}</span>
                                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                  {location.shortcode}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteLocation(location.id)}
                                disabled={deleteLocation.isPending}
                                data-testid={`button-delete-location-from-warehouse-${location.id}`}
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          ))}
                          {(!locationsByWarehouse[warehouse.id] || locationsByWarehouse[warehouse.id].length === 0) && (
                            <p className="text-xs text-muted-foreground italic">No locations added yet</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {warehouses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No warehouses added yet</p>
                )}
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This holds the multiple locations of warehouse, rooms etc..
              </p>

              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border space-y-4" data-testid="location-form">
                <h3 className="font-semibold text-lg">Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loc-name">Name:</Label>
                    <Input
                      id="loc-name"
                      placeholder="Location name"
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      data-testid="input-location-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loc-code">Short Code:</Label>
                    <Input
                      id="loc-code"
                      placeholder="e.g., ZA"
                      value={locationForm.shortcode}
                      onChange={(e) => setLocationForm({ ...locationForm, shortcode: e.target.value })}
                      data-testid="input-location-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loc-warehouse">Warehouse:</Label>
                    <select
                      id="loc-warehouse"
                      value={locationForm.warehouseId}
                      onChange={(e) => setLocationForm({ ...locationForm, warehouseId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="select-location-warehouse"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse: any) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.shortcode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleAddLocation}
                  className="w-full md:w-auto"
                  disabled={createLocation.isPending}
                  data-testid="button-add-location"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createLocation.isPending ? "Adding..." : "Add Location"}
                </Button>
              </div>

              {/* Location List */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Short Code</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location: any) => {
                      const warehouse = warehousesMap[location.warehouseId];
                      return (
                        <TableRow key={location.id} data-testid={`row-location-${location.id}`}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.shortcode}</TableCell>
                          <TableCell>{warehouse ? `${warehouse.name} (${warehouse.shortcode})` : "Unknown"}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLocation(location.id)}
                              disabled={deleteLocation.isPending}
                              data-testid={`button-delete-location-${location.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {locations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No locations added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
