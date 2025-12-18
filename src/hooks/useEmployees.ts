import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useEmployees = (page: number = 0) => {
  return useQuery({
    queryKey: ["employees", "page", page],
    queryFn: async () => {
      const response = await api.get(`/employees?page=${page}`);

      return response.data;
    },
  });
};
