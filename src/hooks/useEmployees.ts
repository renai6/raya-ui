import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useEmployees = (
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  return useQuery({
    queryKey: ["employees", startDate, endDate],
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
      const response = await api.get(`/employees`, { params });

      return response.data;
    },
  });
};
