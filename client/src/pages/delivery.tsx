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
import { Search, Plus, Eye, Edit } from "lucide-react";

// Mock data - Delivery Orders (Outgoing Goods)
const deliveryOrders = [
  {
    id: "1",
    deliveryNumber: "DO/2024/0001",
    customer: "ABC Corporation",
    deliveryDate: "2024-01-12",
    totalItems: 50,
    totalCost: 4568.00,
    status: "Picked",
  },
  {
    id: "2",
    deliveryNumber: "DO/2024/0002",
    customer: "XYZ Limited",
    deliveryDate: "2024-01-14",
    totalItems: 75,
    totalCost: 2835.00,
    status: "Packed",
  },
  {
    id: "3",
    deliveryNumber: "DO/2024/0003",
    customer: "Global Traders Inc.",
    deliveryDate: "2024-01-15",
    totalItems: 30,
    totalCost: 1290.00,
    status: "Validated",
  },
  {
    id: "4",
    deliveryNumber: "DO/2024/0004",
    customer: "ABC Corporation",
    deliveryDate: "2024-01-18",
    totalItems: 100,
    totalCost: 6520.00,
    status: "Validated",
  },
];

const statusColors: Record<string, string> = {
  Picked: "bg-blue-100 text-blue-800",
  Packed: "bg-yellow-100 text-yellow-800",
  Validated: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

export default function Delivery() {
  const [, setLocation] = useLocation();
  const [deliveries, setDeliveries] = useState(deliveryOrders);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Delivery Orders (Outgoing Goods)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage delivery orders - items shipped to customers. Stock decreases automatically upon validation.
          </p>
        </div>
        <Button onClick={() => setLocation("/delivery/new")} data-testid="button-create-delivery">
          <Plus className="w-4 h-4 mr-2" />
          Create Delivery Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by delivery number or customer..."
                  className="pl-10"
                  data-testid="input-search-deliveries"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-48"
              data-testid="input-date-filter"
            />
          </div>

          {/* Delivery Orders Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead className="text-right">Total Items</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow
                    key={delivery.id}
                    data-testid={`row-delivery-${delivery.id}`}
                  >
                    <TableCell className="font-medium">{delivery.deliveryNumber}</TableCell>
                    <TableCell className="text-sm">{delivery.customer}</TableCell>
                    <TableCell className="text-sm">{delivery.deliveryDate}</TableCell>
                    <TableCell className="text-right font-medium">
                      {delivery.totalItems} units
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${delivery.totalCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[delivery.status]}
                        data-testid={`badge-status-${delivery.id}`}
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLocation(`/delivery/${delivery.id}`)}
                          data-testid={`button-view-delivery-${delivery.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLocation(`/delivery/${delivery.id}/edit`)}
                          data-testid={`button-edit-delivery-${delivery.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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

