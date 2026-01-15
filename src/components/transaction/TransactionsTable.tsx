import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, MoveRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

import type { Product, Sale } from "@/types";
import { useState } from "react";
import { useSalesDated } from "@/hooks/useSalesDated";
import { toast } from "sonner";

const TransactionsTable = ({
  inventoryTransactions,
  products,
}: {
  inventoryTransactions: any;
  products: {
    count: number;
    products: Product[];
  };
}) => {
  const [startDate, setStartDate] = useState<undefined | Date>();
  const [endDate, setEndDate] = useState<undefined | Date>();

  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const { data: sales } = useSalesDated(startDate, endDate);

  const getTransactionType = (transaction: any) => {
    const transactioTypes = [];

    if (transaction.oldQuantity !== transaction.newQuantity) {
      transactioTypes.push("Stock In");
    }

    if (transaction.oldRetailPrice !== transaction.newRetailPrice) {
      transactioTypes.push("Price Update");
    }

    return transactioTypes.join(", ");
  };

  const getQuantityChange = (transaction: any) => {
    if (transaction.oldQuantity < transaction.newQuantity) {
      return (
        <div className="flex items-center gap-2">
          {transaction.newQuantity - transaction.oldQuantity}{" "}
          <MoveRight className="w-4" /> {transaction.newQuantity}
        </div>
      );
    } else {
      return transaction.oldQuantity - transaction.newQuantity;
    }
  };

  const getPriceChange = (transaction: any) => {
    if (transaction.oldRetailPrice !== transaction.newRetailPrice) {
      return (
        <div className="flex items-center gap-2">
          {transaction.oldRetailPrice} <MoveRight className="w-4" />{" "}
          {transaction.newRetailPrice}
        </div>
      );
    } else {
      return transaction.oldRetailPrice;
    }
  };

  const getTotalItemsSold = (product: Product) => {
    return (
      sales
        ?.filter((sale: Sale) => sale.productId === product.id)
        .reduce((sum: number, sale: Sale) => sum + sale.quantity, 0) || 0
    );
  };

  const handleExportSales = () => {
    const headers = [
      "Date",
      "Name",
      "Barcode",
      "Price",
      "Quantity Sold",
      "Total Amount",
    ];
    const data = sales.map((sale: any) => [
      sale.createdAt,
      sale.product.name,
      sale.product.barcode,
      sale.product.retailPrice,
      sale.quantity,
      sale.quantity * sale.product.retailPrice,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(
      workbook,
      `sales-report-${startDate?.toISOString().split("T")[0]}-${
        endDate?.toISOString().split("T")[0]
      }.xlsx`
    );
    toast.success("Sales report exported successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        defaultValue="sales"
        onValueChange={(e) => {
          console.log(e);
        }}
      >
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Popover
                open={isStartCalendarOpen}
                onOpenChange={setIsStartCalendarOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {startDate
                      ? new Date(startDate).toLocaleDateString()
                      : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setStartDate(date || new Date());
                      setIsStartCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Popover
                open={isEndCalendarOpen}
                onOpenChange={setIsEndCalendarOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {endDate ? endDate.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    disabled={(date) => (startDate ? date < startDate : false)}
                    onSelect={(date) => {
                      console.log(date || new Date());
                      setEndDate(date || new Date());
                      setIsEndCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="secondary"
                onClick={() => {
                  setEndDate(undefined);
                  setStartDate(undefined);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
        <TabsContent value="inventory">
          <Card className="mt-3 mb-4 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.75)] border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="mb-2">Inventory Transactions</h1>
                  <small className="text-amber-500">
                    A list of your transactions
                  </small>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="max-h-140 overflow-auto pr-2 custom-scrollbar">
                <Table>
                  <TableHeader className="dark:bg-neutral-800">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Quantity Change</TableHead>
                      <TableHead>Price Change</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryTransactions.map((transaction: any) => (
                      <TableRow
                        className="cursor-pointer hover:bg-muted"
                        key={transaction.id}
                      >
                        <TableCell className="font-medium">
                          {transaction.createdAt.split("T")[0]}
                        </TableCell>
                        <TableCell>{transaction.product.name}</TableCell>
                        <TableCell>{transaction.product.barcode}</TableCell>
                        <TableCell>{getQuantityChange(transaction)}</TableCell>
                        <TableCell>{getPriceChange(transaction)}</TableCell>
                        <TableCell>{getTransactionType(transaction)}</TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales">
          <Card className="mt-3 mb-4 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.75)] border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="mb-2">Sales</h1>
                  <small className="text-amber-500">A list of your sales</small>
                </div>
                <Button
                  variant="default"
                  onClick={handleExportSales}
                  disabled={!startDate && !endDate}
                >
                  <Download className="w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="max-h-140 overflow-auto pr-2 custom-scrollbar">
                <Table>
                  <TableHeader className="dark:bg-neutral-800">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Items Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.products.map((product: Product) => (
                      <TableRow
                        className="cursor-pointer hover:bg-muted"
                        key={product.id}
                      >
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.barcode}</TableCell>
                        <TableCell>{product.retailPrice}</TableCell>
                        <TableCell>{getTotalItemsSold(product)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsTable;
