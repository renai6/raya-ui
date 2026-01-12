import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useInventoryTransactions = () => {
  return useQuery({
    queryKey: ["inventoryTransactions"],
    queryFn: async () => {
      const response = await api.get(`/transactions/inventory`);
      return response.data;
    },
  });
};
