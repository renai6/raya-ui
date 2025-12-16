import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  useIsEditQuantityDialogOpen,
  useQuantity,
  useSalesActions,
} from "@/stores/sales";

const ItemQuantityDialog = () => {
  const { setEditQuantityDialogOpen, setQuantity } = useSalesActions();
  const isEditQuantityDialogOpen = useIsEditQuantityDialogOpen();
  const quantity = useQuantity();

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setEditQuantityDialogOpen(false);
  };

  const checkZero = (number: string) => {
    if (number === "q") return "0";

    if (number === "") return "0";

    if (number[0] === "0") {
      return number.substring(1);
    }

    return number;
  };

  const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = checkZero(e.target.value);

    if (isNaN(e.target.value as unknown as number)) return;
    setQuantity(parseInt(number));
  };

  return (
    <Dialog
      open={isEditQuantityDialogOpen}
      onOpenChange={setEditQuantityDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quantity</DialogTitle>
          <DialogDescription>Update item quantity to be sold</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                name="quantity"
                value={quantity}
                onChange={handleChangeQuantity}
                className="text-center"
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemQuantityDialog;
