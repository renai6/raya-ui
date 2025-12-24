import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ShoppingCart, PenLine } from "lucide-react";
import { Button } from "../ui/button";
import CartItems from "./CartItems";
import {
  useQuantity,
  useSalesActions,
  useSalesCartItems,
} from "@/stores/sales";

const Cart = () => {
  const { clearCart } = useSalesActions();
  const quantity = useQuantity();
  const cartItems = useSalesCartItems();

  return (
    <Card className="shadow-lg gap-0 mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-yellow-400" />
            <span>
              Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </CardTitle>

          <div>
            {quantity ? (
              <div className="flex gap-3">
                <p>Adding {quantity} items </p>
                <PenLine className="w-5 h-5 text-yellow-400" />
              </div>
            ) : null}
            {cartItems.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-400 border-red-600 hover:bg-red-900/20 bg-transparent"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <hr className="mb-2" />
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
            <p>No items in cart</p>
            <p className="text-sm">Scan a barcode to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <CartItems
                key={`${item.id}-${item.saleType}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;
