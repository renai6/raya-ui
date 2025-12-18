import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useProductsReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["productsReport", "startDate", "endDate", startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/products/reports/data`, {
        params: { startDate, endDate },
        responseType: "blob",
      });
      return response.data;
    },
    enabled: false,
  });
};
