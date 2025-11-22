import { useQuery } from "@tanstack/react-query";
import type { SalesOrder } from "@shared/schema";

export function useSalesOrders() {
  return useQuery<SalesOrder[]>({
    queryKey: ["/api/sales-orders"],
  });
}
