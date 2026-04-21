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
    mutationFn: async (data: {
      id: string;
      payload: { closingCash?: number; borrowedCash?: number };
    }) => {
      const response = await api.put(
        `/users/${data.id}/cash-sessions`,
        data.payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashSession"] });
    },
  });

  return {
    createCashSession,
    updateCashSession,
  };
};
