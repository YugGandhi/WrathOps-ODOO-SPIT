import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus } from "lucide-react";

// Mock data - All Transfers
const stockMoves = [
  {
    id: "1",
    date: "2024-01-20",
    reference: "WH/INT/0020",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 3",
    product: "Oak Wood Plank",
    quantity: 50,
    status: "Done",
  },
  {
    id: "2",
    date: "2024-01-19",
    reference: "WH/REC/0015",
    type: "Receipt",
    fromLocation: "External Supplier",
    toLocation: "Warehouse B - Zone 1",
    product: "Metal Brackets Set",
    quantity: 200,
    status: "Done",
  },
  {
    id: "3",
    date: "2024-01-19",
    reference: "WH/DEL/0010",
    type: "Delivery",
    fromLocation: "Warehouse A - Zone 2",
    toLocation: "Customer - ABC Corp",
    product: "Paint - White Gloss",
    quantity: 10,
    status: "Done",
  },
  {
    id: "4",
    date: "2024-01-18",
    reference: "WH/INT/0019",
    type: "Internal",
    fromLocation: "Warehouse B - Zone 1",
    toLocation: "Warehouse A - Zone 1",
    product: "Steel Rods",
    quantity: 75,
    status: "Ready",
  },
  {
    id: "5",
    date: "2024-01-18",
    reference: "WH/ADJ/0005",
    type: "Adjustment",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 1",
    product: "Pine Wood Board",
    quantity: -15,
    status: "Done",
  },
  {
    id: "6",
    date: "2024-01-17",
    reference: "WH/REC/0014",
    type: "Receipt",
    fromLocation: "External Supplier",
    toLocation: "Warehouse A - Zone 2",
    product: "Screws Box (1000 pcs)",
    quantity: 50,
    status: "Done",
  },
  {
    id: "7",
    date: "2024-01-17",
    reference: "WH/INT/0018",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 3",
    toLocation: "Warehouse B - Zone 1",
    product: "Oak Wood Plank",
    quantity: 30,
    status: "Waiting",
  },
  {
    id: "8",
    date: "2024-01-16",
    reference: "WH/DEL/0009",
    type: "Delivery",
    fromLocation: "Warehouse B - Zone 1",
    toLocation: "Customer - XYZ Ltd",
    product: "Metal Brackets Set",
    quantity: 100,
    status: "Done",
  },
  {
    id: "9",
    date: "2024-01-16",
    reference: "WH/INT/0017",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 2",
    product: "Paint - White Gloss",
    quantity: 25,
    status: "Done",
  },
  {
    id: "10",
    date: "2024-01-15",
    reference: "WH/REC/0013",
    type: "Receipt",
    fromLocation: "External Supplier",
    toLocation: "Warehouse A - Zone 1",
    product: "Steel Rods",
    quantity: 120,
    status: "Done",
  },
  {
    id: "11",
    date: "2024-01-15",
    reference: "WH/INT/0016",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 2",
    toLocation: "Warehouse B - Zone 1",
    product: "Pine Wood Board",
    quantity: 45,
    status: "Done",
  },
  {
    id: "12",
    date: "2024-01-14",
    reference: "WH/DEL/0008",
    type: "Delivery",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Customer - Global Traders",
    product: "Oak Wood Plank",
    quantity: 80,
    status: "Done",
  },
  {
    id: "13",
    date: "2024-01-14",
    reference: "WH/ADJ/0004",
    type: "Adjustment",
    fromLocation: "Warehouse B - Zone 1",
    toLocation: "Warehouse B - Zone 1",
    product: "Screws Box (1000 pcs)",
    quantity: 10,
    status: "Done",
  },
  {
    id: "14",
    date: "2024-01-13",
    reference: "WH/INT/0015",
    type: "Internal",
    fromLocation: "Warehouse B - Zone 1",
    toLocation: "Warehouse A - Zone 3",
    product: "Metal Brackets Set",
    quantity: 150,
    status: "Ready",
  },
  {
    id: "15",
    date: "2024-01-13",
    reference: "WH/REC/0012",
    type: "Receipt",
    fromLocation: "External Supplier",
    toLocation: "Warehouse A - Zone 1",
    product: "Paint - White Gloss",
    quantity: 20,
    status: "Done",
  },
  {
    id: "16",
    date: "2024-01-12",
    reference: "WH/INT/0014",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 2",
    product: "Steel Rods",
    quantity: 60,
    status: "Done",
  },
  {
    id: "17",
    date: "2024-01-12",
    reference: "WH/DEL/0007",
    type: "Delivery",
    fromLocation: "Warehouse A - Zone 2",
    toLocation: "Customer - Tech Solutions",
    product: "Pine Wood Board",
    quantity: 35,
    status: "Done",
  },
  {
    id: "18",
    date: "2024-01-11",
    reference: "WH/INT/0013",
    type: "Internal",
    fromLocation: "Warehouse A - Zone 3",
    toLocation: "Warehouse B - Zone 1",
    product: "Oak Wood Plank",
    quantity: 40,
    status: "Done",
  },
  {
    id: "19",
    date: "2024-01-11",
    reference: "WH/ADJ/0003",
    type: "Adjustment",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 1",
    product: "Metal Brackets Set",
    quantity: -5,
    status: "Done",
  },
  {
    id: "20",
    date: "2024-01-10",
    reference: "WH/REC/0011",
    type: "Receipt",
    fromLocation: "External Supplier",
    toLocation: "Warehouse B - Zone 1",
    product: "Screws Box (1000 pcs)",
    quantity: 80,
    status: "Done",
  },
];

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  Waiting: "bg-yellow-100 text-yellow-800",
  Ready: "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
};

export default function StockMoves() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Stock Moves</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage stock movements between locations
          </p>
        </div>
        <Button onClick={() => setLocation("/stock-moves/new")} data-testid="button-create-move">
          <Plus className="w-4 h-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stock Movements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference or product..."
                  className="pl-10"
                  data-testid="input-search-moves"
                />
              </div>
            </div>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
            <Select>
              <SelectTrigger className="w-48" data-testid="select-location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="wa-z1">Warehouse A - Zone 1</SelectItem>
                <SelectItem value="wa-z2">Warehouse A - Zone 2</SelectItem>
                <SelectItem value="wb-z1">Warehouse B - Zone 1</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Moves Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>From Location</TableHead>
                  <TableHead>To Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockMoves.map((move) => (
                  <TableRow
                    key={move.id}
                    className="cursor-pointer hover-elevate"
                    data-testid={`row-move-${move.id}`}
                  >
                    <TableCell className="text-sm">{move.date}</TableCell>
                    <TableCell className="font-medium">{move.reference}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          move.type === "Receipt" ? "bg-green-50 text-green-700 border-green-200" :
                          move.type === "Delivery" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          move.type === "Internal" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        }
                      >
                        {move.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{move.product}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {move.fromLocation}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {move.toLocation}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${move.quantity < 0 ? 'text-red-600' : ''}`}>
                      {move.quantity > 0 ? '+' : ''}{move.quantity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[move.status]}
                        data-testid={`badge-status-${move.id}`}
                      >
                        {move.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
