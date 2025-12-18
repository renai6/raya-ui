import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) return;
      const response = await api.get(`/employees/${id}`);
      return response.data;
    },
  });
};
