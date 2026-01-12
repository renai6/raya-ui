import { Badge } from "@/components/ui/badge";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useTransactionsByDay,
  useTransactionsByYesterday,
  useTransactionsByMonth,
} from "@/hooks/useTransactions";
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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();
  const { data: transactionsYesterday, isLoading: isLoadingYesterday } =
    useTransactionsByYesterday();
  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useProductsLowStock();
  const { data: productSales, isLoading: isLoadingProductSales } =
    useProductsSaleChart();
  const { data: transactionsMonth, isLoading: isLoadingMonth } =
    useTransactionsByMonth(selectedMonth, selectedYear);
  const user = useAuthUser();

  if (
    isLoadingToday ||
    isLoadingYesterday ||
    isLoadingLowStock ||
    isLoadingProductSales ||
    isLoadingMonth
  ) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Dashboard Data</h2>
      </div>
    );
  }

  function getPercentChange(today: number, yesterday: number) {
    if (yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const totalRevenue =
    transactionsToday?.reduce((acc: number, tx: any) => acc + tx.total, 0) || 0;

  const totalRevenueYesterday =
    transactionsYesterday?.reduce(
      (acc: number, tx: any) => acc + tx.total,
      0
    ) || 0;

  const percentChange = getPercentChange(totalRevenue, totalRevenueYesterday);

  const isIncrease = percentChange >= 0;

  const chartSalesData = productSales.map(
    (product: Product & { sales: Sale[] }) => ({
      name: product.name,
      value: product?.sales?.reduce((sum: number, data: Sale) => {
        sum = sum + data.quantity * data.total;

        return sum;
      }, 0),
    })
  );

  const currentDate = new Date();

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />

      <div className="mb-5 flex flex-col gap-6 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardDescription>Daily Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(totalRevenue)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {isIncrease ? (
                  <IconTrendingUp color="green" />
                ) : (
                  <IconTrendingDown color="red" />
                )}
                {percentChange > 0
                  ? `+${percentChange.toFixed(1)}%`
                  : `${percentChange.toFixed(1)}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Total revenue from invoices within the day
            </div>
          </CardFooter>
        </Card>
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              Monthly Revenue
              <div className="flex gap-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "short",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem
                        key={currentDate.getFullYear() - i}
                        value={(currentDate.getFullYear() - i).toString()}
                      >
                        {currentDate.getFullYear() - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(transactionsMonth.totalSales)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Total revenue for{" "}
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </div>
          </CardFooter>
        </Card>
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
          <CardHeader>
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {transactionsToday?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Based on invoices</div>
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
