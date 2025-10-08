import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    },
  });
};
