import { useQuery } from "@tanstack/react-query";
import type { PurchaseOrder } from "@shared/schema";

export function usePurchaseOrders() {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });
}
