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

// Mock data
const stockMoves = [
  {
    id: "1",
    date: "2024-01-15",
    reference: "WH/INT/0012",
    fromLocation: "Warehouse A - Zone 1",
    toLocation: "Warehouse A - Zone 3",
    product: "Oak Wood Plank",
    quantity: 50,
    status: "Done",
  },
  {
    id: "2",
    date: "2024-01-14",
    reference: "WH/INT/0011",
    fromLocation: "Warehouse A - Zone 2",
    toLocation: "Warehouse B - Zone 1",
    product: "Metal Brackets Set",
    quantity: 200,
    status: "Ready",
  },
  {
    id: "3",
    date: "2024-01-14",
    reference: "WH/INT/0010",
    fromLocation: "Warehouse B - Zone 1",
    toLocation: "Warehouse A - Zone 1",
    product: "Paint - White Gloss",
    quantity: 10,
    status: "Waiting",
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
        <Button data-testid="button-create-move">
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
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="done">Done</SelectItem>
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
                    <TableCell className="text-sm">{move.product}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {move.fromLocation}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {move.toLocation}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {move.quantity}
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
