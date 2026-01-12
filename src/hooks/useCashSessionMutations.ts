import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useCashSessionMutations = () => {
  const queryClient = useQueryClient();

  const createCashSession = useMutation({
    mutationFn: async (data: { userId: string; openingCash: number }) => {
      const response = await api.post(`/users/${data.userId}/cash-sessions`, {
        openingCash: data.openingCash,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("cashSessionId", data.id);
      queryClient.invalidateQueries({ queryKey: ["cashSession"] });
    },
  });

  const updateCashSession = useMutation({
    mutationFn: async (data: { id: string; closingCash: number }) => {
      const response = await api.put(`/users/${data.id}/cash-sessions`, {
        closingCash: data.closingCash,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cashSession"] });

      window.open(`/print-cash-checkout/${data.id}`, "_blank");
    },
  });

  return {
    createCashSession,
    updateCashSession,
  };
};
