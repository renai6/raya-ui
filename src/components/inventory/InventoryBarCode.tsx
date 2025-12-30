import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Scan } from "lucide-react";
import { Input } from "../ui/input";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  openAddProduct: () => void;
  setProduct: (product: Product) => void;
};

const InventoryBarCode = ({ products, openAddProduct, setProduct }: Props) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcodeInput.trim()) return;

    const product = products.find(
      (p: Product) => p.barcode === barcodeInput.trim()
    );

    if (product) {
      setProduct(product);
      openAddProduct();
    } else {
      setProduct({
        name: "",
        barcode: barcodeInput.trim(),
        retailPrice: 0,
        wholesalePrice: 0,
        stock: 0,
      });
      openAddProduct();
    }

    setBarcodeInput("");
  };

  return (
    <Card className="gap-0 shadow-[0_8px_15px_rgba(0,0,0,0.6)] border-none mb-5">
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
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default InventoryBarCode;
