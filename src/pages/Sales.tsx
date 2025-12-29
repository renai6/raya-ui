import Cart from "@/components/sales/Cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import { Check, CreditCard, X, HandCoins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCreateSale } from "@/hooks/useCreateSale";
import { useAuthUser } from "@/stores/authStore";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ItemQuantityDialog from "@/components/sales/ItemQuantityDialog";
import SalesBarCode from "@/components/sales/BarCode";
import { useEmployee } from "@/hooks/useEmployee";

const Sales = () => {
  const { setCashReceived, clearCart, setEditQuantityDialogOpen } =
    useSalesActions();

  const isEditQuantityDialogOpen = useIsEditQuantityDialogOpen();
  const cartItems = useSalesCartItems();
  const cashReceived = useSalesCashReceived();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createSale } = useCreateSale();
  const user = useAuthUser();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isWaitingBarcode, setIsWaitingBarcode] = useState(true);
  const [paymentType, setPaymentType] = useState<"CASH" | "CREDIT">("CASH");
  const [employeeBarcode, setEmployeeBarcode] = useState("");

  const { data: employee } = useEmployee(employeeBarcode);

  const processPayment = async () => {
    setPaymentDialogOpen(false);
    createSale({
      sales: cartItems,
      cashReceived,
      paymentType,
      employeeBarcode: paymentType === "CREDIT" ? employeeBarcode : undefined,
    });
    clearCart();
    setCashReceived(0);
    setPaymentType("CASH");
    setEmployeeBarcode("");
  };

  const cashInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();

      if (event.code === "KeyQ") {
        if (isEditQuantityDialogOpen) return;

        setEditQuantityDialogOpen(true);
      }

      if (event.code === "F9") {
        if (isEditQuantityDialogOpen) return;

        setIsWaitingBarcode(true);
      }

      if (event.code === "KeyC") {
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
  }, [cartItems, cashReceived, isEditQuantityDialogOpen, paymentType]);

  const onOpenPaymentDialog = () => {
    if (cartItems.length === 0) return;
    if (
      paymentType === "CASH" &&
      (cartItems.length === 0 || cashReceived < total)
    )
      return;
    if (
      paymentType === "CREDIT" &&
      (!employee?.id || employee?.totalCredit + total > 2000)
    )
      return;

    setPaymentDialogOpen(true);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.selectedPrice * item.quantity,
    0
  );

  const total = subtotal;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <Header title="Sales Checkout" user={{ email: user?.email }} />

      <div className="grid lg:grid-cols-3 gap-7">
        {/* Left Column - Barcode Input & Item List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <SalesBarCode
            products={productsData.products || []}
            isWaitingBarcode={isWaitingBarcode}
            setIsWaitingBarcode={setIsWaitingBarcode}
          />

          {/* Item List */}
          <Cart />
        </div>

        {/* Right Column - Summary Card */}
        <div className="space-y-8">
          <Card className="shadow-lg sticky top-4 gap-1 shadow-[0_8px_25px_rgba(0,0,0,0.6)] border-none">
            <CardHeader>
              <CardTitle className="flex justify-between items-center space-x-2">
                <div className="flex gap-3 items-center">
                  <HandCoins className="w-5 h-5 text-amber-400" />
                  <span>Payment Summary</span>
                </div>
                <div className="space-y-3">
                  {paymentType === "CASH" ? (
                    <Button
                      onClick={onOpenPaymentDialog}
                      disabled={cartItems.length === 0 || cashReceived < total}
                    >
                      <CreditCard className="w-4" />
                      Process Payment
                    </Button>
                  ) : (
                    <Button
                      onClick={onOpenPaymentDialog}
                      disabled={
                        cartItems.length === 0 ||
                        !employee?.id ||
                        employee?.totalCredit + total > 2000
                      }
                    >
                      <CreditCard className="w-4" />
                      Process Payment
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 mt-2">
                <Label className="text-sm font-medium">Payment Type</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value: "CASH" | "CREDIT") => {
                    setPaymentType(value);
                    setCashReceived(0);
                    setEmployeeBarcode("");
                  }}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash" className="text-sm font-medium">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CREDIT" id="credit" />
                    <Label htmlFor="credit" className="text-sm font-medium">
                      Credit
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {paymentType === "CREDIT" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Employee Number</Label>
                  <Input
                    value={employeeBarcode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (isNaN(Number(e.target.value))) {
                        return;
                      }
                      setEmployeeBarcode(e.target.value);
                    }}
                    placeholder="Scan employee barcode"
                    className={`mb-0 ${
                      employeeBarcode !== "" &&
                      (employee?.totalCredit + total > 2000 || !employee?.id)
                        ? "border-red-400"
                        : ""
                    }`}
                    autoFocus
                  />
                  {employee?.totalCredit + total > 2000 && (
                    <small className="text-red-400">
                      Employee exceeded credit limit
                    </small>
                  )}
                  {employeeBarcode !== "" && !employee?.id && (
                    <small className="text-red-400">
                      Employee number not found
                    </small>
                  )}
                  {employee?.id && (
                    <div className="bg-zinc-700/30 rounded-lg p-4 space-y-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Employee Number</span>
                        <span>{employeeBarcode}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Employee Name</span>
                        <span>{employee?.name}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span>Total credit</span>
                          <small className="dark:text-yellow-500 text-yellow-600">
                            Total credit must not exceed ₱2000
                          </small>
                        </div>
                        <span>{employee?.totalCredit}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cash Received</Label>
                  <Input
                    ref={cashInputRef}
                    className={`mb-0 ${
                      cashReceived < total && cashReceived !== 0
                        ? "border-red-400"
                        : ""
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCashReceived(Number(e.target.value))
                    }
                    value={cashReceived || ""}
                  />
                  {cashReceived < total && cashReceived !== 0 && (
                    <small className="text-red-400">Insufficient Cash</small>
                  )}
                </div>
              )}

              <div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-400">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-xs space-y-1">
                    <p>
                      Items:{" "}
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="mt-5 pl-5 flex flex-col space-y-2">
            <h2 className="text-bold">Key Controls</h2>

            <p className="text-sm">
              <span className="text-bold text-amber-600">C</span> : Activate
              cash input
            </p>
            <p className="text-sm">
              <span className="text-bold text-amber-600">Q</span> : Open
              quantity dialog
            </p>
            <p className="text-sm">
              <span className="text-bold text-amber-600">F9</span> : Activate
              barcode input
            </p>
            <p className="text-sm">
              <span className="text-bold text-amber-600">F8</span> : Proceed to
              payment summary
            </p>
            <p className="text-sm">
              <span className="text-bold text-amber-600">Tab</span> : Navigating
              the cursor between inputs and buttons
            </p>
            <p className="text-sm">
              <span className="text-bold text-amber-600">Esc</span> : Closing
              dialogs
            </p>
          </div>
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
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="space-y-4">
                <Card className="border-none p-2 gap-0">
                  <CardHeader className="p-2">
                    <CardTitle>Transaction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {/* Items List */}
                    <div className="space-y-2 max-h-60 custom-scrollbar overflow-y-auto mb-3 pr-2">
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
                            0
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
                            Total credit must not exceed ₱2000
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
                <Button onClick={processPayment} className="flex-1">
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Sales;
