import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get(`/employees`);

      return response.data;
    },
  });
};
