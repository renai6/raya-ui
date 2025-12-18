export type SaleType = "RETAIL" | "WHOLESALE";
export type TransactionPaymentType = "CASH" | "CREDIT";

export interface Product {
  id?: string;
  name: string;
  stock: number;
  retailPrice: number;
  wholesalePrice: number;
  barcode: string;
}

export interface Employee {
  id?: string;
  employeeNumber: string;
  name: string;
  contactNumber: string;
  email: string;
  totalCredit?: number;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  stock: number;
  retailPrice: number;
  wholesalePrice: number;
  barcode: string;
  quantity: number;
  selectedPrice: number;
  saleType: SaleType;
}

export type Sale = {
  createdAt: string;
  id: string;
  productId: string;
  quantity: number;
  saleType: SaleType;
  total: number;
  transactionId: string;
};
