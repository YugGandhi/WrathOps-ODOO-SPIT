import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Contact, InsertContact } from "@shared/schema";

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });
}

export function useContact(id: string | undefined) {
  return useQuery<Contact>({
    queryKey: ["/api/contacts", id],
    enabled: !!id,
  });
}

export function useCreateContact() {
  return useMutation({
    mutationFn: async (data: InsertContact) => {
      return apiRequest("POST", "/api/contacts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });
}

export function useUpdateContact(id: string) {
  return useMutation({
    mutationFn: async (data: Partial<InsertContact>) => {
      return apiRequest("PATCH", `/api/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", id] });
    },
  });
}

export function useDeleteContact() {
  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/contacts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });
}
