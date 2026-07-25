import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { useTransactionsBySpecificDay } from "@/hooks/useTransactions";
import { Spinner } from "../ui/spinner";

const DailyRevenue = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const previousDay = new Date(selectedDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsBySpecificDay(selectedDate);
  const { data: transactionsYesterday, isLoading: isLoadingYesterday } =
    useTransactionsBySpecificDay(previousDay);

  function getPercentChange(today: number, yesterday: number) {
    if (yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  }

  if (isLoadingToday || isLoadingYesterday) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            Daily Revenue
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    selectedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Spinner className="size-8 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-between items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total revenue from invoices for {selectedDate.getMonth() + 1}{" "}
            {selectedDate.getDate()}
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            <IconTrendingUp />
            {0}
          </Badge>
        </CardFooter>
      </Card>
    );
  }

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
    <Card className="shadow-card">
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          Daily Revenue
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(totalRevenue)}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Total revenue from invoices for{" "}
          {new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1 - 1,
            selectedDate.getDate()
          ).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}
        </div>
        <Badge
          variant="outline"
          className={
            isIncrease
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }
        >
          {isIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
          {percentChange > 0
            ? `+${percentChange.toFixed(1)}%`
            : `${percentChange.toFixed(1)}%`}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default DailyRevenue;
