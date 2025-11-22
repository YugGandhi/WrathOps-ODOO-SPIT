import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

// Mock warehouse data
const mockWarehouses = [
  { id: "1", name: "Main Warehouse", shortCode: "MW", address: "123 Business Street, New York, NY 10001" },
  { id: "2", name: "Secondary Warehouse", shortCode: "SW", address: "456 Industrial Ave, Brooklyn, NY 11201" },
];

// Mock location data
const mockLocations = [
  { id: "1", name: "Zone A", shortCode: "ZA", warehouse: "MW" },
  { id: "2", name: "Zone B", shortCode: "ZB", warehouse: "MW" },
  { id: "3", name: "Receiving", shortCode: "RCV", warehouse: "SW" },
];

export default function Settings() {
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [locations, setLocations] = useState(mockLocations);
  const [warehouseForm, setWarehouseForm] = useState({ name: "", shortCode: "", address: "" });
  const [locationForm, setLocationForm] = useState({ name: "", shortCode: "", warehouse: "" });
  const { toast } = useToast();

  const handleAddWarehouse = () => {
    if (!warehouseForm.name || !warehouseForm.shortCode || !warehouseForm.address) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    setWarehouses([...warehouses, { id: String(warehouses.length + 1), ...warehouseForm }]);
    toast({
      title: "Success",
      description: "Warehouse added successfully",
    });
    setWarehouseForm({ name: "", shortCode: "", address: "" });
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
    toast({
      title: "Success",
      description: "Warehouse deleted successfully",
    });
  };

  const handleAddLocation = () => {
    if (!locationForm.name || !locationForm.shortCode || !locationForm.warehouse) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    setLocations([...locations, { id: String(locations.length + 1), ...locationForm }]);
    toast({
      title: "Success",
      description: "Location added successfully",
    });
    setLocationForm({ name: "", shortCode: "", warehouse: "" });
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    toast({
      title: "Success",
      description: "Location deleted successfully",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This page contains the warehouse details & location.
        </p>
      </div>

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
                      value={warehouseForm.shortCode}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, shortCode: e.target.value })}
                      data-testid="input-warehouse-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wh-address">Address:</Label>
                    <Input
                      id="wh-address"
                      placeholder="Warehouse address"
                      value={warehouseForm.address}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                      data-testid="input-warehouse-address"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddWarehouse}
                  className="w-full md:w-auto"
                  data-testid="button-add-warehouse"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Warehouse
                </Button>
              </div>

              {/* Warehouse Hierarchy */}
              <div className="space-y-3" data-testid="warehouse-hierarchy">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id} data-testid={`card-warehouse-${warehouse.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{warehouse.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{warehouse.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {warehouse.shortCode}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWarehouse(warehouse.id)}
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
                          {locations
                            .filter(loc => loc.warehouse === warehouse.shortCode)
                            .map((location) => (
                              <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded" data-testid={`location-in-warehouse-${location.id}`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">→</span>
                                  <span className="text-sm font-medium">{location.name}</span>
                                  <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                    {location.shortCode}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLocation(location.id)}
                                  data-testid={`button-delete-location-from-warehouse-${location.id}`}
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            ))}
                          {locations.filter(loc => loc.warehouse === warehouse.shortCode).length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No locations added yet</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                      value={locationForm.shortCode}
                      onChange={(e) => setLocationForm({ ...locationForm, shortCode: e.target.value })}
                      data-testid="input-location-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loc-warehouse">Warehouse:</Label>
                    <Select value={locationForm.warehouse} onValueChange={(value) => setLocationForm({ ...locationForm, warehouse: value })}>
                      <SelectTrigger id="loc-warehouse" data-testid="select-location-warehouse">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.shortCode}>
                            {warehouse.name} ({warehouse.shortCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAddLocation}
                  className="w-full md:w-auto"
                  data-testid="button-add-location"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
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
                    {locations.map((location) => (
                      <TableRow key={location.id} data-testid={`row-location-${location.id}`}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.shortCode}</TableCell>
                        <TableCell>{location.warehouse}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLocation(location.id)}
                            data-testid={`button-delete-location-${location.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
