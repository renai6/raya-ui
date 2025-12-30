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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FileText } from "lucide-react";
import { useEmployeesReport } from "@/hooks/useEmployeesReport";
import { useProductsReport } from "@/hooks/useProductsReport";
import { COLORS } from "@/lib/contants";
import { Spinner } from "@/components/ui/spinner";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();
  const { data: transactionsYesterday, isLoading: isLoadingYesterday } =
    useTransactionsByYesterday();
  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useProductsLowStock();
  const { data: productSales, isLoading: isLoadingProductSales } =
    useProductsSaleChart();
  const { refetch: refetchEmployeeReport } = useEmployeesReport(
    startDate,
    endDate
  );
  const { refetch: refetchProductsReport } = useProductsReport(
    startDate,
    endDate
  );

  const user = useAuthUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"inventory" | "employee">(
    "inventory"
  );

  if (
    isLoadingToday ||
    isLoadingYesterday ||
    isLoadingLowStock ||
    isLoadingProductSales
  ) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Dashboard Data</h2>
      </div>
    );
  }

  const generateReport = async () => {
    try {
      if (reportType === "inventory") {
        const filename = `inventory-report-${Date.now()}.pdf`;
        const { data } = await refetchProductsReport();
        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const filename = `employee-report-${Date.now()}.pdf`;
        const { data } = await refetchEmployeeReport();
        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

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

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />
      {user?.role === "ADMIN" && (
        <div className="mb-4 flex justify-end">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate PDF Report</DialogTitle>
                <DialogDescription>
                  Select the type of report and date to generate a PDF.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Report Type</Label>
                  <RadioGroup
                    value={reportType}
                    onValueChange={(value: "inventory" | "employee") =>
                      setReportType(value)
                    }
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inventory" id="inventory" />
                      <Label htmlFor="inventory">Inventory</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem disabled value="employee" id="employee" />
                      <Label htmlFor="employee">Employee</Label>
                    </div>
                  </RadioGroup>
                </div>
                {reportType === "employee" && (
                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="flex space-x-2 mt-1">
                      <div className="flex-1">
                        <Label htmlFor="startDate" className="mb-1 text-xs">
                          Start Date
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="endDate" className="mb-1 text-xs">
                          End Date
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={generateReport} className="flex-1">
                    Generate PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className="mb-5 flex flex-col gap-6 xl:flex-row xl:justify-between">
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
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
        <Card className="w-full xl:w-1/4 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none">
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
          <CardContent className="max-h-96 overflow-auto custom-scrollbar">
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
                        product.stock === 0 ? "text-red-500" : "text-amber-500"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
