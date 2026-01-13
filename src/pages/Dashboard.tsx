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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Product, Sale } from "@/types";
import Header from "@/components/header/Header";
import { useAuthUser } from "@/stores/authStore";
import { COLORS } from "@/lib/contants";
import { Spinner } from "@/components/ui/spinner";
import DailyRevenue from "@/components/dashboard/DailyRevenue";
import MonthlyRevenue from "@/components/dashboard/MonthlyRevenue";

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
    })
  );

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />

      <div className="mb-5 flex flex-col gap-6 xl:flex-row xl:justify-between">
        <DailyRevenue />
        <MonthlyRevenue />
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
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
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardDescription>Products low on stock</CardDescription>
            <CardTitle
              className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
                lowStockProducts?.length > 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              {lowStockProducts?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Products with low inventory (less than 10 items)
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="mb-3 flex flex-col gap-6 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/2 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardTitle>Fast moving stocks</CardTitle>
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
                    )
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
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Top 10 fast moving stocks
            </div>
          </CardFooter>
        </Card>
        <Card className="w-full xl:w-1/2 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardTitle className="flex items-start gap-3 space-x-2 flex-col">
              <span>Product List</span>
              <small className="text-amber-500">
                A list of your recent products which are low in stocks
              </small>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-100 overflow-auto pr-2 custom-scrollbar">
              <Table>
                <TableCaption>
                  A list of your recent products which are low in stocks
                </TableCaption>
                <TableHeader className="dark:bg-neutral-800">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Retail Price</TableHead>
                    <TableHead className="text-right">Wholesal Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts?.map((product: Product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell
                        className={`${
                          product.stock === 0
                            ? "text-red-500"
                            : "text-amber-500"
                        } text-right`}
                      >
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.retailPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.wholesalePrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
