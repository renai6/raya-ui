import type { CartItem } from "@/types";
import { Button } from "../ui/button";
import { Edit3, Minus, Plus, TicketPercent, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { useSalesActions } from "@/stores/sales";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  item: CartItem;
  index: number;
};

const CartItems = (props: Props) => {
  const {
    updatePriceType,
    updateQuantity,
    removeItem,
    setEditQuantityDialogOpen,
    setSelectedItem,
  } = useSalesActions();

  const { item, index } = props;

  const onUpdateQuantity = (value: number) => {
    if (value > item.stock || value < 1) return;

    if (value < 10 && item.saleType === "WHOLESALE") {
      updatePriceType(item.id, "RETAIL");
    }

    updateQuantity(item.id, value);
  };

  const onOpenDialog = () => {
    setEditQuantityDialogOpen(true);
    setSelectedItem(item);
  };

  return (
    <div
      key={`${item.id}-${item.saleType}-${index}`}
      className={`p-4 dark:bg-zinc-800 bg-zinc-100 rounded-lg space-y-3 ${
        item.saleType === "WHOLESALE" ? "border border-amber-400" : ""
      }`}
    >
      {/* Item Header */}
      <div className="flex items-start justify-between">
        <div className="flex justify-between w-full items-center">
          <div>
            <h3 className="font-medium text-white text-lg">{item.name}</h3>

            <div className="flex items-center space-x-2 mt-1">
              <Badge
                className={`${
                  item.saleType === "WHOLESALE"
                    ? "bg-amber-900"
                    : "bg-green-800"
                }`}
              >
                {item.saleType === "WHOLESALE" ? "Wholesale" : "Retail"}
              </Badge>
              <span className="text-sm text-gray-400">#{item.barcode}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 gap-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {item.quantity >= 10 && (
                  <Popover>
                    <PopoverTrigger>
                      <TicketPercent className="w-4 h-4 text-amber-400" />
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[400px] mt-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300 font-medium">
                          Price Type
                        </Label>
                        <RadioGroup
                          value={item.saleType}
                          onValueChange={(value: "RETAIL" | "WHOLESALE") =>
                            updatePriceType(item.id, value)
                          }
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="RETAIL"
                              id={`regular-${item.id}-${item.saleType}`}
                              className="border-gray-500"
                              checked={item.saleType === "RETAIL"}
                            />
                            <Label
                              htmlFor={`regular-${item.id}-${item.saleType}`}
                              className="text-sm text-gray-300 cursor-pointer"
                            >
                              Regular - ₱{item.retailPrice.toFixed(2)}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="WHOLESALE"
                              id={`wholesale-${item.id}-${item.saleType}`}
                              className="border-gray-500"
                              checked={item.saleType === "WHOLESALE"}
                            />
                            <Label
                              htmlFor={`wholesale-${item.id}-${item.saleType}`}
                              className="text-sm text-gray-300 cursor-pointer"
                            >
                              Wholesale - ₱{item.wholesalePrice.toFixed(2)}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.quantity - 1)}
                  className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                {/* Edit Quantity Dialog */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDialog()}
                  className="min-w-[60px] h-8 border-gray-600 text-white hover:border-yellow-400 hover:bg-yellow-900/20 bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-1 user-select-none">
                    <span className="font-medium">{item?.quantity}</span>
                    <Edit3 className="w-3 h-3 text-gray-400" />
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.quantity + 1)}
                  className="w-8 h-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
                  disabled={item.quantity + 1 > item.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-lg">
                ₱{(item.selectedPrice * item.quantity).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                ₱{item.selectedPrice.toFixed(2)} each
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 p-0 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Type Selection */}
    </div>
  );
};

export default CartItems;
