import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useSalesDated = (
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  return useQuery({
    queryKey: ["sales", startDate, endDate],
    queryFn: async () => {
      const params: any = {};

      if (startDate)
        params.startDate = `${startDate.getFullYear()}-${
          startDate.getMonth() + 1
        }-${startDate.getDate()}`;

      if (endDate)
        params.endDate = `${endDate.getFullYear()}-${
          endDate.getMonth() + 1
        }-${endDate.getDate()}`;

      const response = await api.get(`/sales/dated`, { params });
      return response.data;
    },
  });
};
