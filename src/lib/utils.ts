import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
};

export const totalDailyRevenue = (transactionsToday: any[]) => {
  const totalRevenue =
    transactionsToday?.reduce((acc: number, tx: any) => acc + tx.total, 0) || 0;
  return totalRevenue;
};

export const totalDailyCreditRevenue = (transactionsToday: any[]) => {
  const totalCreditRevenue =
    transactionsToday?.reduce((acc: number, tx: any) => {
      if (tx.employeeId) {
        acc = acc + tx.total;
      }
      return acc;
    }, 0) || 0;
  return totalCreditRevenue;
};
