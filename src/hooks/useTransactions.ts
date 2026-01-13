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
    queryKey: ["transaction-day"],
    queryFn: async () => {
      const response = await api.get(`/transactions/day`);
      return response.data;
    },
  });
};

export const useTransactionsByYesterday = () => {
  return useQuery({
    queryKey: ["transaction-yesterday"],
    queryFn: async () => {
      const response = await api.get(`/transactions/yesterday`);
      return response.data;
    },
  });
};

export const useTransactionsByMonth = (month: number, year: number) => {
  return useQuery({
    queryKey: ["transactions-month", year, month],
    queryFn: async () => {
      const response = await api.get(`/transactions/monthly/${year}/${month}`);
      return response.data;
    },
  });
};

export const useTransactionsBySpecificDay = (date: Date) => {
  const dateString = date.toISOString().split("T")[0];

  return useQuery({
    queryKey: ["transaction-day", dateString],
    queryFn: async () => {
      const response = await api.get(
        `/transactions/day?date=${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`
      );
      return response.data;
    },
  });
};
