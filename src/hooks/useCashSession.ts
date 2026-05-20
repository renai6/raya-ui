import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useCashSession = (id: string) => {
  return useQuery({
    queryKey: ["cashSession", id],
    queryFn: async () => {
      if (!id) return {};
      const response = await api.get(`/users/${id}/cash-sessions`);
      return response.data;
    },
  });
};

export const useCashSessionById = (id: string) => {
  return useQuery({
    queryKey: ["cashSessionById", id],
    queryFn: async () => {
      if (!id) return {};
      const response = await api.get(`/users/${id}/cash-session`);
      return response.data;
    },
  });
};
