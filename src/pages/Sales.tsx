import Cart from "@/components/sales/Cart";
import SummaryCard from "@/components/sales/SummaryCard";
import TodaySummary from "@/components/sales/TodaySummary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import { Check, X, ChevronRight, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCreateSale } from "@/hooks/useCreateSale";
import { useAuthActions, useAuthUser } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/header/Header";
import {
  useIsEditQuantityDialogOpen,
  useSalesActions,
  useSalesCartItems,
  useSalesCashReceived,
} from "@/stores/sales";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ItemQuantityDialog from "@/components/sales/ItemQuantityDialog";
import SalesBarCode from "@/components/sales/BarCode";
import { useEmployee } from "@/hooks/useEmployee";
import { Spinner } from "@/components/ui/spinner";
import {
  formatCurrency,
  totalDailyCreditRevenue,
  totalDailyRevenue,
} from "@/lib/utils";
import { useTransactionsByDay } from "@/hooks/useTransactions";
import { useCashSession } from "@/hooks/useCashSession";
import { useCashSessionMutations } from "@/hooks/useCashSessionMutations";
import { useNavigate } from "@tanstack/react-router";

const Sales = () => {
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const { setCashReceived, clearCart, setEditQuantityDialogOpen } =
    useSalesActions();

  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();
  const user = useAuthUser();

  const { data: cashSession, isLoading: isCashSessionLoading } = useCashSession(
    user?.sub || "",
  );
  const { createCashSession, updateCashSession } = useCashSessionMutations();

  const isEditQuantityDialogOpen = useIsEditQuantityDialogOpen();
  const cartItems = useSalesCartItems();
  const cashReceived = useSalesCashReceived();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createSale, isPending } = useCreateSale();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isWaitingBarcode, setIsWaitingBarcode] = useState(true);
  const [paymentType, setPaymentType] = useState<"CASH" | "CREDIT">("CASH");
  const [employeeBarcode, setEmployeeBarcode] = useState("");
  const [employeeBarcodeInput, setEmployeeBarcodeInput] = useState("");
  const [isCashCheckoutDialogOpen, setIsCashCheckoutDialogOpen] =
    useState(false);
  const [isBorrowCashDialogOpen, setIsBorrowCashDialogOpen] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState<number>(0);

  const [cashForm, setCashForm] = useState({
    openingCash: "",
    closingCash: "",
  });

  const { data: employee, isLoading: isEmployeeLoading } =
    useEmployee(employeeBarcode);

  const processPayment = async () => {
    if (!cashSession?.id) return;

    setPaymentDialogOpen(false);
    createSale({
      sales: cartItems,
      cashReceived,
      paymentType,
      employeeBarcode: paymentType === "CREDIT" ? employeeBarcode : undefined,
      cashSessionId: cashSession.id,
    });
    clearCart();
    setCashReceived(0);
    setPaymentType("CASH");
    setEmployeeBarcode("");
    setEmployeeBarcodeInput("");
  };

  const cashInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();

      if (!cashSession?.id) return;

      if (event.altKey && event.key.toLowerCase() === "q") {
        if (isEditQuantityDialogOpen) return;

        setEditQuantityDialogOpen(true);
      }

      if (event.code === "F9") {
        if (isEditQuantityDialogOpen) return;

        setIsWaitingBarcode(true);
      }

      if (event.altKey && event.key.toLowerCase() === "w") {
        if (isEditQuantityDialogOpen || paymentType !== "CASH") return;

        if (cashInputRef.current) {
          cashInputRef.current.focus();
        }
      }

      if (event.code === "F8") {
        if (
          isEditQuantityDialogOpen ||
          cartItems.length === 0 ||
          (cashReceived < total && paymentType === "CASH")
        ) {
          return;
        }

        setPaymentDialogOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    cartItems.length,
    cashReceived,
    isEditQuantityDialogOpen,
    paymentType,
    cashSession?.id,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEmployeeBarcode(employeeBarcodeInput);
    }, 500);
    return () => clearTimeout(timeout);
  }, [employeeBarcodeInput]);

  const onLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const handleCashFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCashForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCashFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cashForm.closingCash) {
      const openingCashAmount = parseFloat(cashForm.openingCash);
      if (isNaN(openingCashAmount) || openingCashAmount < 0) {
        return;
      }

      createCashSession.mutate({
        userId: user?.sub || "",
        openingCash: openingCashAmount,
      });
    } else {
      const closingCashAmount = parseFloat(cashForm.closingCash);
      if (isNaN(closingCashAmount) || closingCashAmount < 0) {
        return;
      }

      updateCashSession.mutate({
        id: cashSession?.id,
        payload: { closingCash: closingCashAmount },
      });

      window.open(`/print-cash-checkout/${cashSession?.id}`, "_blank");
      setIsCashCheckoutDialogOpen(false);
    }

    setCashForm({ openingCash: "", closingCash: "" });
  };

  const onOpenPaymentDialog = () => {
    if (!cashSession?.id) return;
    if (cartItems.length === 0) return;
    if (
      paymentType === "CASH" &&
      (cartItems.length === 0 || cashReceived < total)
    )
      return;
    if (
      paymentType === "CREDIT" &&
      (!employee?.id || employee?.totalCredit + total > employee?.creditLimit)
    )
      return;

    setPaymentDialogOpen(true);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.selectedPrice * item.quantity,
    0,
  );

  const total = subtotal;

  if (isLoading || isLoadingToday || isCashSessionLoading) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Products Data</h2>
      </div>
    );
  }

  const totalRevenue = totalDailyRevenue(transactionsToday || []);

  const totalCreditAmount = totalDailyCreditRevenue(transactionsToday || []);

  const expectedCash =
    totalRevenue +
    (cashSession?.openingCash || 0) -
    totalCreditAmount -
    (cashSession?.borrowedCash || 0);

  const handleBorrowCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashSession?.id) return;
    if (borrowAmount <= 0 || borrowAmount > expectedCash) return;

    updateCashSession.mutate({
      id: cashSession.id,
      payload: {
        borrowedCash: (cashSession.borrowedCash || 0) + borrowAmount,
      },
    });

    setBorrowAmount(0);
    setIsBorrowCashDialogOpen(false);
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <Header title="Sales Checkout" user={{ email: user?.email }} />

      <div className="grid lg:grid-cols-3 gap-7">
        {/* Left Column - Barcode Input & Item List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <SalesBarCode
            isCashSessionDialogOpen={!cashSession?.id}
            products={productsData.products || []}
            isWaitingBarcode={isWaitingBarcode}
            setIsWaitingBarcode={setIsWaitingBarcode}
          />

          {/* Item List */}
          <Cart />
        </div>

        {/* Right Column - Summary Card */}
        <div className="space-y-8">
          <SummaryCard
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            cartItems={cartItems}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            total={total}
            onOpenPaymentDialog={onOpenPaymentDialog}
            employeeBarcodeInput={employeeBarcodeInput}
            setEmployeeBarcodeInput={setEmployeeBarcodeInput}
            employeeBarcode={employeeBarcode}
            employee={employee}
            isEmployeeLoading={isEmployeeLoading}
          />
          {cashSession?.id && (
            <TodaySummary
              cashSession={cashSession}
              totalRevenue={totalRevenue}
              totalCreditAmount={totalCreditAmount}
              expectedCash={expectedCash}
              setIsBorrowCashDialogOpen={setIsBorrowCashDialogOpen}
              setIsCashCheckoutDialogOpen={setIsCashCheckoutDialogOpen}
            />
          )}
        </div>
      </div>
      <ItemQuantityDialog />
      <div className="space-y-3 pt-4">
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Payment</DialogTitle>
              <DialogDescription className="text-sm text-amber-500">
                Review items and total before confirming the payment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 ">
              {/* Transaction Summary */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <Card className="border-none p-2 gap-0">
                  <CardHeader className="p-2">
                    <CardTitle>Transaction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {/* Items List */}
                    <div className="space-y-2 max-h-50 custom-scrollbar overflow-y-auto mb-3 pr-2">
                      {cartItems.map((item, index) => (
                        <div
                          key={`${item.id}-${item.saleType}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <div className="flex-1">
                            <span>{item.name}</span>
                            <div className="text-xs">
                              {item.quantity} × ₱{item.selectedPrice.toFixed(2)}{" "}
                              ({item.saleType})
                            </div>
                          </div>
                          <span className="text-white font-medium">
                            ₱{(item.selectedPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-yellow-500">
                          ₱{total.toFixed(2)}
                        </span>
                      </div>
                      {paymentType === "CASH" && (
                        <div className="flex justify-between text-sm">
                          <span>Change</span>
                          <span>₱{(cashReceived - total).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Details */}

                <Card className="border-none p-2 gap-0">
                  <CardHeader className="p-2">
                    <CardTitle>
                      <div className="flex justify-between">
                        <span>Items Count</span>
                        <span>
                          {cartItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="flex justify-between text-sm">
                      <span>Cashier</span>
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date & Time</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {paymentType === "CREDIT" && (
                  <Card className="border-none p-2 gap-0">
                    <CardHeader className="p-2">
                      <CardTitle>
                        <div className="flex justify-between">
                          <span>Employee Number</span>
                          <span>{employeeBarcode}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="flex justify-between text-sm">
                        <span>Employee Name</span>
                        <span>{employee?.name}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span>Total credit</span>
                          <small className="text-yellow-500">
                            Total credit must not exceed ₱
                            {employee?.creditLimit}
                          </small>
                        </div>
                        <span>{employee?.totalCredit}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setPaymentDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={processPayment}
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Spinner className="size-5 mr-2" />
                  ) : (
                    <Check className="w-5 h-5 mr-2" />
                  )}
                  Confirm Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog open={!cashSession?.id}>
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            className="[&>button]:hidden"
          >
            <DialogHeader>
              <DialogTitle>Add Opening Cash</DialogTitle>
              <DialogDescription>
                Enter the starting cash amount to begin your shift. You won’t be
                able to process sales until this is completed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <form className="space-y-4" onSubmit={handleCashFormSubmit}>
                <div>
                  <Label className="mb-2">Opening Cash Amount</Label>
                  <Input
                    name="openingCash"
                    placeholder="₱0.00"
                    required
                    type="number"
                    value={cashForm.openingCash}
                    onChange={handleCashFormChange}
                  />
                  <small className="text-sm text-neutral-500">
                    Count the physical cash in the drawer before entering.
                  </small>
                </div>
              </form>
              <div className="flex items-center justify-end space-x-2">
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={onLogout}>
                    Sign Out
                    <LogOut className="w-4" />
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" onClick={handleCashFormSubmit}>
                    Start Shift
                    <ChevronRight className="w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={isBorrowCashDialogOpen}
          onOpenChange={setIsBorrowCashDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Borrow Cash</DialogTitle>
              <DialogDescription>
                Enter the amount you want to borrow from the cashier. It cannot
                exceed the current expected cash balance.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleBorrowCash}>
              <div>
                <Label className="mb-2">Borrow Amount</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={borrowAmount || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBorrowAmount(Number(e.target.value))
                  }
                  placeholder={`Max ₱${expectedCash.toFixed(2)}`}
                  className={
                    borrowAmount > expectedCash ? "border-red-400" : ""
                  }
                  required
                />
                <small className="text-sm text-neutral-500">
                  Maximum allowed: ₱{expectedCash.toFixed(2)}
                </small>
                {borrowAmount > expectedCash && (
                  <p className="text-sm text-red-400 mt-1">
                    Amount cannot exceed expected cash.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsBorrowCashDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={borrowAmount <= 0 || borrowAmount > expectedCash}
                >
                  Borrow Cash
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={isCashCheckoutDialogOpen}
          onOpenChange={setIsCashCheckoutDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cash Checkout</DialogTitle>
              <DialogDescription>
                You are about to close the cash session for this shift. Please
                count the cash in the drawer and confirm the amount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border border-[2px] rounded-sm p-3">
                <h3 className="text-sm font-semibold mb-2">Cash Summary</h3>
                <div className="flex w-full">
                  <div className="w-full space-y-1">
                    <div>
                      <CardDescription>Opening Cash</CardDescription>
                      <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(cashSession.openingCash || 0)}
                      </CardTitle>
                    </div>
                    <div>
                      <CardDescription>Cash Revenue</CardDescription>
                      <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(totalRevenue - totalCreditAmount)}
                      </CardTitle>
                    </div>
                    <div>
                      <CardDescription>Borrowed Cash</CardDescription>
                      <CardTitle className="text-red-400 ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(cashSession.borrowedCash || 0)}
                      </CardTitle>
                    </div>
                    <div>
                      <CardDescription>Credit Revenue</CardDescription>
                      <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(totalCreditAmount)}
                      </CardTitle>
                    </div>
                    <div>
                      <CardDescription>Total Revenue</CardDescription>
                      <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(totalRevenue)}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <div className="text-center">
                      <h2 className="text-lg font-medium">Expected Cash</h2>
                      <CardTitle className="text-md font-semibold tabular-nums @[250px]/card:text-3xl text-amber-500">
                        {formatCurrency(expectedCash)}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleCashFormSubmit}>
                <div>
                  <Label className="mb-2">Closing Cash Amount</Label>
                  <Input
                    name="closingCash"
                    placeholder="₱0.00"
                    required
                    type="number"
                    value={cashForm.closingCash}
                    onChange={handleCashFormChange}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    Checkout
                    <ChevronRight className="w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Sales;
