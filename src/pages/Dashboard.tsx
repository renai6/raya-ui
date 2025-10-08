import { Badge } from "@/components/ui/badge";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useTransactionsByDay,
  useTransactionsByYesterday,
} from "@/hooks/useTransactions";
import { useProductsLowStock } from "@/hooks/useProducts";

const Dashboard = () => {
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();
  const { data: transactionsYesterday, isLoading: isLoadingYesterday } =
    useTransactionsByYesterday();

  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useProductsLowStock();

  if (isLoadingToday || isLoadingYesterday || isLoadingLowStock) {
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

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/4">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(totalRevenue)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {isIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
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
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
    </div>
  );
};

export default Dashboard;
