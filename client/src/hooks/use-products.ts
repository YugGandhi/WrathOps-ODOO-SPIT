import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useUpdateProduct(id: string) {
  return useMutation({
    mutationFn: async (data: Partial<InsertProduct>) => {
      return apiRequest("PATCH", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", id] });
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}
