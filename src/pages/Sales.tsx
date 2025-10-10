import SalesBarCode from "@/components/sales/BarCode";
import Cart from "@/components/sales/Cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import { Check, CreditCard, DollarSign, X } from "lucide-react";
import { useState } from "react";
import { useCreateSale } from "@/hooks/useCreateSale";
import { useAuthUser } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/header/Header";
import { Badge } from "@/components/ui/badge";
import {
  useSalesActions,
  useSalesCartItems,
  useSalesCashReceived,
  useSalesCurrentScannedItem,
} from "@/stores/sales";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ItemQuantityDialog from "@/components/sales/ItemQuantityDialog";

const Sales = () => {
  const { setCashReceived, clearCart } = useSalesActions();
  const currentScannedItem = useSalesCurrentScannedItem();
  const cartItems = useSalesCartItems();
  const cashReceived = useSalesCashReceived();
  const { data: products } = useProducts();
  const { mutate: createSale } = useCreateSale();
  const user = useAuthUser();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const processPayment = async () => {
    setPaymentDialogOpen(false);
    createSale({ sales: cartItems, cashReceived });
    clearCart();
    setCashReceived(0);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.selectedPrice * item.quantity,
    0
  );

  const total = subtotal;

  return (
    <div className="mx-auto">
      {/* Header */}
      <Header title="Sales Checkout" user={{ email: user?.email }} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Barcode Input & Item List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <SalesBarCode products={products || []} />

          {/* Item List */}
          <Cart />
        </div>

        {/* Right Column - Summary Card */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg sticky top-4 gap-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Cash Received</Label>
                <Input
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
              <div className="space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-400">₱{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Dialog
                  open={paymentDialogOpen}
                  onOpenChange={setPaymentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                      disabled={cartItems.length === 0 || cashReceived < total}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Process Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-white text-xl">
                        Confirm Payment
                      </DialogTitle>
                      <DialogDescription hidden>
                        This is the description of the dialog.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Transaction Summary */}
                      <div className="space-y-4">
                        <div className="bg-zinc-700/30 rounded-lg p-4 space-y-3">
                          <h3 className="text-white font-semibold mb-3">
                            Transaction Summary
                          </h3>

                          {/* Items List */}
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cartItems.map((item, index) => (
                              <div
                                key={`${item.id}-${item.saleType}-${index}`}
                                className="flex justify-between text-sm"
                              >
                                <div className="flex-1">
                                  <span className="text-gray-300">
                                    {item.name}
                                  </span>
                                  <div className="text-xs text-gray-400">
                                    {item.quantity} × ₱
                                    {item.selectedPrice.toFixed(2)} (
                                    {item.saleType})
                                  </div>
                                </div>
                                <span className="text-white font-medium">
                                  ₱
                                  {(item.selectedPrice * item.quantity).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Separator className="bg-gray-600" />

                          {/* Totals */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-white">Total</span>
                              <span className="text-yellow-400">
                                ₱{total.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white">Change</span>
                              <span>₱{(cashReceived - total).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-zinc-700/30 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Items Count</span>
                            <span>
                              {cartItems.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Cashier</span>
                            <span>{user?.email}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Date & Time</span>
                            <span>{new Date().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={processPayment}
                          className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Confirm Payment
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPaymentDialogOpen(false)}
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent h-12"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
          {currentScannedItem && (
            <Card className="gap-0 border-0 shadow-lg bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 animate-in slide-in-from-top-2 duration-300">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center space-x-2 text-purple-300 text-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Item Scanned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg border border-purple-500/20">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {currentScannedItem.name}
                    </h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                      >
                        Retail
                      </Badge>
                      <span className="text-sm text-gray-400">
                        #{currentScannedItem.barcode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      ₱ {currentScannedItem.retailPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">Added to cart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ItemQuantityDialog />
    </div>
  );
};

export default Sales;
