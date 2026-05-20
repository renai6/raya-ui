import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Product } from "@/types";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createBulkProducts = useMutation({
    mutationFn: async ({
      products,
      isPriceExe,
    }: {
      products: Product[];
      isPriceExe: boolean;
    }) => {
      const response = await api.post("/products/bulk", {
        products: products,
        isPriceExe,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return { createBulkProducts };
};
