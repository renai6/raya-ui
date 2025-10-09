import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "../ui/input";
import {
  useIsEditQuantityDialogOpen,
  useSalesActions,
  useSelectedItem,
} from "@/stores/sales";
import { useState } from "react";

const ItemQuantityDialog = () => {
  const { updateQuantity, setEditQuantityDialogOpen } = useSalesActions();
  const isEditQuantityDialogOpen = useIsEditQuantityDialogOpen();
  const selectedItem = useSelectedItem();
  const [quantity, setQuantity] = useState(1);

  const onSave = () => {
    updateQuantity(selectedItem?.id || "", quantity);
    setEditQuantityDialogOpen(false);
  };

  const selectedItemStock = selectedItem?.stock || 0;
  return (
    <Dialog
      open={isEditQuantityDialogOpen}
      onOpenChange={setEditQuantityDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit Quantity - {selectedItem?.name} {selectedItem?.id}
          </DialogTitle>
          <DialogDescription>
            This is the description of the dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 p-0 border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Input
              type="number"
              min="1"
              max="9999"
              value={quantity}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 1;
                setQuantity(Math.min(Math.max(1, value), 9999));
              }}
              className="text-center text-xl font-bold bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400/20"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 p-0 border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10, 25, 50, 100].map((qty) => (
              <Button
                key={qty}
                variant="outline"
                size="sm"
                onClick={() => setQuantity(qty)}
                className={`h-10 transition-all duration-200 ${
                  quantity === qty
                    ? "bg-green-600 text-white border-green-500"
                    : "border-gray-600 text-gray-300 hover:border-green-400 hover:bg-green-900/20 bg-gray-800/50"
                }`}
                disabled={quantity === qty || qty > selectedItemStock}
              >
                {qty}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={onSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditQuantityDialogOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemQuantityDialog;
