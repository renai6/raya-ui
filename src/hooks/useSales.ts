import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await api.get("/sales");
      return response.data;
    },
  });
};
