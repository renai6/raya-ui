import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useTransactionsByMonth } from "@/hooks/useTransactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";

const MonthlyRevenue = () => {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: transactionsMonth, isLoading: isLoadingMonth } =
    useTransactionsByMonth(selectedMonth, selectedYear);

  if (isLoadingMonth) {
    return (
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
                <SelectContent></SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Spinner className="size-8 text-amber-500" />
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
    );
  }

  const currentDate = new Date();
  return (
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
  );
};

export default MonthlyRevenue;
