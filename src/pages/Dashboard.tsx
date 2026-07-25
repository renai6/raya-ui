import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactionsBySpecificDay } from "@/hooks/useTransactions";
import { useProductsLowStock, useProductsSaleChart } from "@/hooks/useProducts";
import DataTable, { type Column } from "@/components/ui/data-table";
import SectionCard from "@/components/ui/section-card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Product, Sale } from "@/types";
import Header from "@/components/header/Header";
import { useAuthUser } from "@/stores/authStore";
import { COLORS } from "@/lib/contants";
import { Spinner } from "@/components/ui/spinner";
import DailyRevenue from "@/components/dashboard/DailyRevenue";
import MonthlyRevenue from "@/components/dashboard/MonthlyRevenue";
import { formatCurrency } from "@/lib/utils";

const lowStockColumns: Column<Product>[] = [
  {
    key: "name",
    header: "Item",
    cell: (product) => product.name,
    className: "font-medium",
  },
  {
    key: "barcode",
    header: "Barcode",
    cell: (product) => product.barcode,
    className: "text-muted-foreground tabular-nums",
  },
  {
    key: "stock",
    header: "Quantity",
    align: "right",
    cell: (product) => (
      <span
        className={product.stock === 0 ? "text-destructive" : "text-primary"}
      >
        {product.stock}
      </span>
    ),
  },
  {
    key: "retailPrice",
    header: "Retail Price",
    align: "right",
    cell: (product) => formatCurrency(product.retailPrice),
  },
];

const Dashboard = () => {
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsBySpecificDay(new Date());

  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useProductsLowStock();
  const { data: productSales, isLoading: isLoadingProductSales } =
    useProductsSaleChart();
  const user = useAuthUser();

  if (isLoadingToday || isLoadingLowStock || isLoadingProductSales) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Dashboard Data</h2>
      </div>
    );
  }

  const chartSalesData = productSales.map(
    (product: Product & { sales: Sale[] }) => ({
      name: product.name,
      value: product?.sales?.reduce((sum: number, data: Sale) => {
        sum = sum + data.quantity * data.total;

        return sum;
      }, 0),
    }),
  );

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DailyRevenue />
        <MonthlyRevenue />
        <Card className="shadow-card">
          <CardHeader>
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {transactionsToday?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Customer count for the day
            </div>
          </CardFooter>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardDescription>Products low on stock</CardDescription>
            <CardTitle
              className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
                lowStockProducts?.length > 0 ? "text-destructive" : ""
              }`}
            >
              {lowStockProducts?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Products with fewer than 10 items in stock
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base leading-none">
              Fast moving stocks
            </CardTitle>
            <CardDescription>Top 10 by revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  data={chartSalesData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  fill="#c4c700ff"
                >
                  {chartSalesData.map(
                    (entry: { name: string }, index: number) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    return `₱ ${value.toLocaleString()}`; // Default for other values
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <SectionCard
          title="Low on stock"
          description={`${lowStockProducts?.length || 0} products below 10 items`}
        >
          <DataTable
            columns={lowStockColumns}
            rows={lowStockProducts ?? []}
            rowKey={(product) => String(product.id)}
            maxHeight="max-h-[22rem]"
            emptyMessage="Every product is above the low stock threshold."
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default Dashboard;
