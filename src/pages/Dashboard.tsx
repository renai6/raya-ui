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

const Dashboard = () => {
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();
  const { data: transactionsYesterday, isLoading: isLoadingYesterday } =
    useTransactionsByYesterday();
  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useProductsLowStock();
  const { data: productSales, isLoading: isLoadingProductSales } =
    useProductsSaleChart();

  const user = useAuthUser();

  if (
    isLoadingToday ||
    isLoadingYesterday ||
    isLoadingLowStock ||
    isLoadingProductSales
  ) {
    return <div>Loading...</div>;
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

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#e64a7eff",
    "#0b9bd4ff",
    "#FF8042",
    "#c6ff42ff",
    "#42ff71ff",
    "#8442ffff",
  ];

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />
      <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/4">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
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
        <Card className="w-full xl:w-1/4">
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
        <Card className="w-full xl:w-1/4">
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
        <Card className="w-full xl:w-1/4">
          <CardHeader>
            <CardDescription>Growth Rate in Customers</CardDescription>
            <CardTitle
              className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
                getPercentChange(
                  transactionsToday?.length || 0,
                  transactionsYesterday?.length || 0
                ) < 0
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {getPercentChange(
                transactionsToday?.length || 0,
                transactionsYesterday?.length || 0
              ).toFixed(1)}
              %
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Customers today versus yesterday
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/2">
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
        <Card className="w-full xl:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Product List</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                A list of your recent products which are low in stocks
              </TableCaption>
              <TableHeader>
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
                    <TableCell className="text-right">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
