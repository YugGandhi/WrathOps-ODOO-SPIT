import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStockMoves } from "@/hooks/use-stock-moves";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockMoves() {
  const { data: moves, isLoading } = useStockMoves();
  const stockMoves = moves || [];
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Stock Movements</h1>
        <p className="text-muted-foreground mt-1">Track internal transfers and stock movements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stock Move History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or location..."
                className="pl-9"
                data-testid="input-search"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-[180px]"
              data-testid="input-date-from"
            />
            <Input
              type="date"
              className="w-[180px]"
              data-testid="input-date-to"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stockMoves.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No stock movements found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMoves.map((move) => (
                    <TableRow key={move.id} className="hover-elevate" data-testid={`row-move-${move.id}`}>
                      <TableCell className="font-mono text-sm">
                        {move.date ? new Date(move.date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">{move.reference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{move.fromLocation}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{move.toLocation}</TableCell>
                      <TableCell className="text-right font-semibold">{move.quantity}</TableCell>
                      <TableCell>
                        <StatusBadge status={move.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" data-testid={`button-view-${move.id}`}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
