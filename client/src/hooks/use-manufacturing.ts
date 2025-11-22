import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ManufacturingOrder, InsertManufacturingOrder } from "@shared/schema";

export function useManufacturingOrders() {
  return useQuery<ManufacturingOrder[]>({
    queryKey: ["/api/manufacturing-orders"],
  });
}

export function useManufacturingOrder(id: string | undefined) {
  return useQuery<ManufacturingOrder>({
    queryKey: ["/api/manufacturing-orders", id],
    enabled: !!id,
  });
}

export function useCreateManufacturingOrder() {
  return useMutation({
    mutationFn: async (data: InsertManufacturingOrder) => {
      return apiRequest("POST", "/api/manufacturing-orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing-orders"] });
    },
  });
}

export function useUpdateManufacturingOrder(id: string) {
  return useMutation({
    mutationFn: async (data: Partial<InsertManufacturingOrder>) => {
      return apiRequest("PATCH", `/api/manufacturing-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturing-orders", id] });
    },
  });
}
