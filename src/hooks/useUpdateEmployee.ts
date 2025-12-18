import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Employee } from "@/types";

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Employee) => {
      const response = await api.put(`/employees/${data.id}`, {
        employeeNumber: data.employeeNumber,
        name: data.name,
        contactNumber: data.contactNumber,
        email: data.email,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};
