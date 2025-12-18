import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useEmployeesReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["employeeReport", "startDate", "endDate", startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/employees/reports/data`, {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      return response.data;
    },
    enabled: false,
  });
};
