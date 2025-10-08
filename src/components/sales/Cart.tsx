import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import CartItems from "./CartItems";
import { useSalesActions, useSalesCartItems } from "@/stores/sales";

const Cart = () => {
  const { clearCart } = useSalesActions();
  const cartItems = useSalesCartItems();

  return (
    <Card className="border-0 shadow-lg gap-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <ShoppingCart className="w-5 h-5 text-yellow-400" />
            <span>
              Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </CardTitle>
          {cartItems.length > 0 && (
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
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items in cart</p>
            <p className="text-sm">Scan a barcode to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
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
