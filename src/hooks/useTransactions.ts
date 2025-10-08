import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get(`/transactions`);
      return response.data;
    },
  });
};

export const useTransactionsByDay = () => {
  return useQuery({
    queryKey: ["transaction"],
    queryFn: async () => {
      const response = await api.get(`/transactions/day`);
      return response.data;
    },
  });
};

export const useTransactionsByYesterday = () => {
  return useQuery({
    queryKey: ["transaction"],
    queryFn: async () => {
      const response = await api.get(`/transactions/yesterday`);
      return response.data;
    },
  });
};
