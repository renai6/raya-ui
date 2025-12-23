import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Employee } from "@/types";

export const useCreateBulkEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Employee[]) => {
      const response = await api.post("/employees/bulk", { employees: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};
