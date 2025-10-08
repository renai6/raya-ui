import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { CartItem } from "@/types";
import { toast } from "sonner";

type CreateSaleType = {
  sales: CartItem[];
  cashReceived: number;
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleType) => {
      const response = await api.post("/sales", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Optionally refetch sales or other queries
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      toast.success(`Transaction Completed!`);
      window.open(`/print/${data.transaction}`, "_blank");
    },
  });
};
