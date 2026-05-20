import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, HandCoins } from "lucide-react";

interface SummaryCardProps {
  paymentType: "CASH" | "CREDIT";
  setPaymentType: (value: "CASH" | "CREDIT") => void;
  cartItems: Array<{
    id: string;
    selectedPrice: number;
    quantity: number;
  }>;
  cashReceived: number;
  setCashReceived: (value: number) => void;
  total: number;
  onOpenPaymentDialog: () => void;
  employeeBarcodeInput: string;
  setEmployeeBarcodeInput: (value: string) => void;
  employeeBarcode: string;
  employee: {
    id?: string;
    name?: string;
    totalCredit?: number;
    creditLimit?: number;
  } | null;
  isEmployeeLoading: boolean;
}

const SummaryCard = ({
  paymentType,
  setPaymentType,
  cartItems,
  cashReceived,
  setCashReceived,
  total,
  onOpenPaymentDialog,
  employeeBarcodeInput,
  setEmployeeBarcodeInput,
  employeeBarcode,
  employee,
  isEmployeeLoading,
}: SummaryCardProps) => {
  const cashInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="shadow-lg gap-1 shadow-[0_8px_20px_rgba(0,0,0,0.3)] border-none">
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
                  (employee?.totalCredit ?? 0) + total >
                    (employee?.creditLimit ?? 0)
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
              setEmployeeBarcodeInput("");
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
              value={employeeBarcodeInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (isNaN(Number(value))) {
                  return;
                }
                setEmployeeBarcodeInput(value);
              }}
              placeholder="Scan employee barcode"
              className={`mb-0 ${
                employeeBarcode !== "" &&
                ((employee?.totalCredit ?? 0) + total >
                  (employee?.creditLimit ?? 0) ||
                  !employee?.id)
                  ? "border-red-400"
                  : ""
              }`}
              autoFocus
            />
            {(employee?.totalCredit ?? 0) + total >
              (employee?.creditLimit ?? 0) && (
              <small className="text-red-400">
                Employee exceeded credit limit
              </small>
            )}
            {employeeBarcode !== "" && !employee?.id && !isEmployeeLoading && (
              <small className="text-red-400">Employee number not found</small>
            )}

            {isEmployeeLoading && (
              <div className="bg-zinc-700/30 rounded-lg p-4 flex gap-1 justify-center flex-col items-center mt-3">
                <Spinner className="size-6 text-amber-500" />
                <small>Fetching employee data</small>
              </div>
            )}

            {employee?.id && (
              <div className="bg-neutral-200 dark:bg-zinc-700/30 rounded-lg p-4 space-y-3 mt-3">
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
                      Total credit must not exceed ₱{employee?.creditLimit ?? 0}
                    </small>
                  </div>
                  <span>{employee?.totalCredit ?? 0}</span>
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
                Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
