import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Product } from "@/types";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Product) => {
      const response = await api.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      // Optionally refetch products or other queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
