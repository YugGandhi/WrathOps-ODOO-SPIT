import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CompanySettings, InsertCompanySettings } from "@shared/schema";

export function useCompanySettings() {
  return useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
  });
}

export function useUpdateCompanySettings() {
  return useMutation({
    mutationFn: async (data: InsertCompanySettings) => {
      return apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}
