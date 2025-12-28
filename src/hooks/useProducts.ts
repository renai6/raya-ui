import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get(`/products`);

      return response.data;
    },
  });
};

export const useProductsLowStock = () => {
  return useQuery({
    queryKey: ["low-stocks"],
    queryFn: async () => {
      const response = await api.get("/products/low-stocks");
      return response.data;
    },
  });
};

export const useProductsSaleChart = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await api.get("/products/sales");
      return response.data;
    },
  });
};
