import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Scan } from "lucide-react";
import { Input } from "../ui/input";
import type { Product } from "@/types";
import { toast } from "sonner";
import { useQuantity, useSalesActions } from "@/stores/sales";

type Props = {
  products: Product[];
  isWaitingBarcode: boolean;
  setIsWaitingBarcode: React.Dispatch<React.SetStateAction<boolean>>;
};

const SalesBarCode = ({
  products,
  isWaitingBarcode,
  setIsWaitingBarcode,
}: Props) => {
  const { setCurrentScannedItem, addProductToCart, setQuantity } =
    useSalesActions();
  const quantity = useQuantity();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input
  useEffect(() => {
    if (inputRef.current && isWaitingBarcode) {
      inputRef.current.focus();
    }
  }, [isWaitingBarcode]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(
      (p: Product) => p.barcode === barcodeInput.trim()
    );

    if (product && product.stock <= 0) {
      toast.error(`Product ${product.name} is out of stock`);

      return;
    } else if (product && product.stock < quantity) {
      toast.error(`Product ${product.name} only has ${product.stock} left`);

      return;
    } else if (product) {
      // Add directly to cart with default settings
      addProductToCart(product);
      setCurrentScannedItem(product);
      setQuantity(0);
      // Clear the current scanned item after 3 seconds
      setTimeout(() => setCurrentScannedItem(null), 3000);
      setIsScanning(false);
    } else {
      // Handle unknown barcode
      toast.error(`Product ${barcodeInput} not found`);
    }
    setQuantity(0);
    setBarcodeInput("");
  };

  return (
    <Card className="gap-0">
      <CardHeader className="mb-1">
        <CardTitle className="flex items-center space-x-2">
          <Scan className="w-5 h-5 text-yellow-400" />
          <span>Barcode Scanner</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleBarcodeSubmit}
          className="flex space-x-3 items-center"
        >
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Scan barcode or enter manually..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="text-lg h-12 pr-12"
              autoComplete="off"
              onBlur={() => setIsWaitingBarcode(false)}
            />
            {isScanning && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SalesBarCode;
