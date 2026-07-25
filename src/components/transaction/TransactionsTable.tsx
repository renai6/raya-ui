import { Download, MoveRight, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/ui/data-table";
import DateRangeFilter from "@/components/ui/date-range-filter";
import SearchInput from "@/components/ui/search-input";
import SectionCard from "@/components/ui/section-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import type { Product, Sale } from "@/types";
import { useState } from "react";
import { useSalesDated } from "@/hooks/useSalesDated";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { endOfDay, format, startOfDay } from "date-fns";

// toISOString() would report the previous day for any timezone ahead of UTC,
// so the filename has to be built from the local date.
const formatDateForFilename = (date: Date | undefined) =>
  date ? format(date, "yyyy-MM-dd") : "all";

type InventoryTransaction = {
  id: string;
  createdAt: string;
  reason: string;
  oldQuantity: number;
  newQuantity: number;
  oldRetailPrice: number;
  newRetailPrice: number;
  product: Product;
};

type SalesTransaction = {
  id: string;
  number?: string | number;
  createdAt: string;
  total: number;
  cashReceived: number;
  employee?: { name: string };
  sales?: {
    id: string;
    quantity: number;
    total: number;
    product: Product;
  }[];
};

const TransactionsTable = ({
  inventoryTransactions,
  products,
}: {
  inventoryTransactions: InventoryTransaction[];
  products: {
    count: number;
    products: Product[];
  };
}) => {
  const [startDate, setStartDate] = useState<undefined | Date>();
  const [endDate, setEndDate] = useState<undefined | Date>();

  const [selectedTransaction, setSelectedTransaction] =
    useState<SalesTransaction | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  const [productNameSearch, setProductNameSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const { data: sales } = useSalesDated(startDate, endDate);
  const { data: transactions, isLoading: isTransactionsLoading } =
    useTransactions();

  // The calendar returns local midnight, so the range has to be widened to
  // whole days - otherwise picking the same date twice only matches
  // transactions created at exactly 00:00:00.
  const isWithinDateRange = (createdAt: string) => {
    const date = new Date(createdAt);
    return (
      (!startDate || date >= startOfDay(startDate)) &&
      (!endDate || date <= endOfDay(endDate))
    );
  };

  const getTransactionType = (transaction: InventoryTransaction) => {
    const transactioTypes = [];

    if (transaction.oldQuantity !== transaction.newQuantity) {
      transactioTypes.push("Stock In");
    } else if (transaction.oldRetailPrice !== transaction.newRetailPrice) {
      transactioTypes.push("Price Update");
    } else {
      transactioTypes.push("Stock Description Update");
    }

    return transactioTypes.join(", ");
  };

  const getQuantityChange = (transaction: InventoryTransaction) => {
    if (transaction.oldQuantity === transaction.newQuantity) {
      return "No Change";
    } else {
      return (
        <div className="flex items-center gap-2">
          {transaction.oldQuantity === 0
            ? 0
            : transaction.newQuantity - transaction.oldQuantity}{" "}
          <MoveRight className="w-4" /> {transaction.newQuantity}
        </div>
      );
    }
  };

  const getPriceChange = (transaction: InventoryTransaction) => {
    if (transaction.reason === "Initial stock") {
      return transaction.newRetailPrice;
    } else if (transaction.oldRetailPrice !== transaction.newRetailPrice) {
      return (
        <div className="flex items-center gap-2">
          {transaction.oldRetailPrice} <MoveRight className="w-4" />{" "}
          {transaction.newRetailPrice}
        </div>
      );
    } else {
      return "No Change";
    }
  };

  const getTotalItemsSold = (product: Product) => {
    return (
      sales
        ?.filter((sale: Sale) => sale.productId === product.id)
        .reduce((sum: number, sale: Sale) => sum + sale.quantity, 0) || 0
    );
  };

  const handleTransactionClick = (transaction: SalesTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const handlePrintReceipt = () => {
    if (selectedTransaction) {
      window.open(`/print/${selectedTransaction.id}`, "_blank");
    }
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
    const data = sales.map((sale: Sale & { product: Product }) => [
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
      `sales-report-${formatDateForFilename(startDate)}-${formatDateForFilename(
        endDate,
      )}.xlsx`,
    );
    toast.success("Sales report exported successfully!");
  };

  const filteredInventoryTransactions = (inventoryTransactions ?? []).filter(
    (transaction) =>
      transaction.product.name
        .toLowerCase()
        .includes(productNameSearch.toLowerCase()) &&
      isWithinDateRange(transaction.createdAt),
  );

  const filteredSaleProducts = products.products.filter((product: Product) =>
    product.name.toLowerCase().includes(productNameSearch.toLowerCase()),
  );

  const filteredTransactions: SalesTransaction[] =
    transactions?.filter(
      (transaction: SalesTransaction) =>
        (transaction.number || transaction.id)
          .toString()
          .toLowerCase()
          .includes(invoiceSearch.toLowerCase()) &&
        isWithinDateRange(transaction.createdAt),
    ) || [];

  const transactionsTotal = filteredTransactions.reduce(
    (sum: number, transaction: SalesTransaction) => sum + (transaction.total ?? 0),
    0,
  );

  const dateRangeLabel =
    startDate || endDate
      ? ` from ${startDate ? format(startDate, "MMM d, yyyy") : "the start"} to ${
          endDate ? format(endDate, "MMM d, yyyy") : "today"
        }`
      : "";

  const inventoryColumns: Column<InventoryTransaction>[] = [
    {
      key: "createdAt",
      header: "Date",
      cell: (transaction) =>
        new Date(transaction.createdAt).toLocaleDateString(),
      className: "font-medium",
    },
    {
      key: "product",
      header: "Product",
      cell: (transaction) => transaction.product.name,
    },
    {
      key: "barcode",
      header: "Barcode",
      cell: (transaction) => transaction.product.barcode,
      className: "text-muted-foreground tabular-nums",
    },
    {
      key: "quantityChange",
      header: "Quantity Change",
      cell: (transaction) => getQuantityChange(transaction),
    },
    {
      key: "priceChange",
      header: "Price Change",
      cell: (transaction) => getPriceChange(transaction),
    },
    {
      key: "type",
      header: "Transaction Type",
      cell: (transaction) => getTransactionType(transaction),
    },
    {
      key: "reason",
      header: "Remarks",
      cell: (transaction) => transaction.reason,
      className: "text-muted-foreground",
    },
  ];

  const salesColumns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
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
      key: "retailPrice",
      header: "Retail Price",
      align: "right",
      cell: (product) => formatCurrency(product.retailPrice),
    },
    {
      key: "itemsSold",
      header: "Items Sold",
      align: "right",
      cell: (product) => getTotalItemsSold(product),
    },
  ];

  const transactionColumns: Column<SalesTransaction>[] = [
    {
      key: "createdAt",
      header: "Date",
      cell: (transaction) =>
        new Date(transaction.createdAt).toLocaleDateString(),
    },
    {
      key: "number",
      header: "Invoice No.",
      cell: (transaction) => transaction.number || transaction.id,
      className: "font-medium tabular-nums",
    },
    {
      key: "paymentType",
      header: "Payment Type",
      cell: (transaction) =>
        transaction.cashReceived === 0 ? "CREDIT" : "CASH",
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (transaction) => formatCurrency(transaction.total ?? 0),
    },
    {
      key: "cashReceived",
      header: "Cash Received",
      align: "right",
      cell: (transaction) => formatCurrency(transaction.cashReceived ?? 0),
    },
    {
      key: "change",
      header: "Change",
      align: "right",
      cell: (transaction) =>
        formatCurrency(
          transaction.cashReceived > 0
            ? transaction.cashReceived - transaction.total
            : 0,
        ),
    },
  ];

  const handleExportTransactions = () => {
    const headers = [
      "Date",
      "Invoice No.",
      "Payment Type",
      "Total",
      "Cash Received",
      "Change",
    ];
    const data = filteredTransactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.number || transaction.id,
      transaction.cashReceived === 0 ? "CREDIT" : "CASH",
      transaction.total?.toFixed(2),
      transaction.cashReceived?.toFixed(2),
      transaction.cashReceived > 0
        ? (transaction.cashReceived - transaction.total).toFixed(2)
        : "0.00",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(
      workbook,
      `transactions-report-${formatDateForFilename(
        startDate,
      )}-${formatDateForFilename(endDate)}.xlsx`,
    );
    toast.success("Transactions report exported successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="inventory" className="gap-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <SectionCard
            title="Inventory Transactions"
            description={`${filteredInventoryTransactions.length} stock movements${dateRangeLabel}`}
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SearchInput
                  placeholder="Search product name"
                  value={productNameSearch}
                  onChange={setProductNameSearch}
                  className="w-full max-w-sm"
                />
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            }
          >
            <DataTable
              columns={inventoryColumns}
              rows={filteredInventoryTransactions}
              rowKey={(transaction) => String(transaction.id)}
              emptyMessage="No stock movements in this range."
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="sales">
          <SectionCard
            title="Sales"
            description={`${filteredSaleProducts.length} products${dateRangeLabel}`}
            actions={
              <Button
                variant="default"
                onClick={handleExportSales}
                disabled={!startDate && !endDate}
              >
                <Download className="w-4" />
                Export
              </Button>
            }
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SearchInput
                  placeholder="Search product name"
                  value={productNameSearch}
                  onChange={setProductNameSearch}
                  className="w-full max-w-sm"
                />
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            }
          >
            <DataTable
              columns={salesColumns}
              rows={filteredSaleProducts}
              rowKey={(product) => String(product.id)}
              emptyMessage="No products match this search."
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="transactions">
          <SectionCard
            title="Sales Transactions"
            description={`${filteredTransactions.length} invoices, ${formatCurrency(
              transactionsTotal,
            )}${dateRangeLabel}`}
            actions={
              <Button variant="default" onClick={handleExportTransactions}>
                <Download className="w-4" />
                Export
              </Button>
            }
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SearchInput
                  placeholder="Search invoice number"
                  value={invoiceSearch}
                  onChange={setInvoiceSearch}
                  className="w-full max-w-sm"
                />
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
            }
          >
            <DataTable
              columns={transactionColumns}
              rows={filteredTransactions}
              rowKey={(transaction) => String(transaction.id)}
              onRowClick={handleTransactionClick}
              isLoading={isTransactionsLoading}
              emptyMessage="No invoices in this range."
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Invoice Number</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.number || selectedTransaction.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Type</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.cashReceived === 0 ? "CREDIT" : "CASH"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedTransaction.total ?? 0)}
                  </p>
                </div>
                {selectedTransaction.cashReceived > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium">
                        Cash Received
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(selectedTransaction.cashReceived ?? 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Change</label>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(
                          selectedTransaction.cashReceived -
                            selectedTransaction.total,
                        )}
                      </p>
                    </div>
                  </>
                )}
                {selectedTransaction.employee && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Employee</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransaction.employee.name}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Items</label>
                <div className="space-y-2">
                  {selectedTransaction.sales?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} pcs @ {formatCurrency(item.total)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.total * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTransactionDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsTable;
