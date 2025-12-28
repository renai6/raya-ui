import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

type Props = {
  isItemAddDialogOpen: boolean;
  setIsItemAddDialogOpen: (open: boolean) => void;
  form: {
    name: string;
    barcode: string;
    retailPrice: number;
    wholesalePrice: number;
    stock: number;
  };
  selectedProduct: Product | null;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AddProductDialog = (props: Props) => {
  const {
    isItemAddDialogOpen,
    setIsItemAddDialogOpen,
    form,
    selectedProduct,
    handleFormSubmit,
    handleFormChange,
  } = props;

  return (
    <Dialog open={isItemAddDialogOpen} onOpenChange={setIsItemAddDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedProduct?.id ? "Edit" : "Add"} Product
          </DialogTitle>
          <DialogDescription hidden>
            This is the description of the dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <Label className="mb-2">Product Name</Label>
              <Input
                name="name"
                value={form?.name}
                onChange={handleFormChange}
                placeholder="Product Name"
                required
              />
            </div>
            <div>
              <Label className="mb-2">Barcode</Label>
              <Input
                disabled
                name="barcode"
                value={form?.barcode}
                onChange={handleFormChange}
                placeholder="Barcode"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="mb-2">Retail Price</Label>
                <Input
                  name="retailPrice"
                  type="number"
                  step="0.01"
                  value={form?.retailPrice}
                  onChange={handleFormChange}
                  placeholder="Retail Price"
                  required
                />
              </div>
              <div className="flex-1">
                <Label className="mb-2">Wholesale Price</Label>
                <Input
                  name="wholesalePrice"
                  type="number"
                  step="0.01"
                  value={form?.wholesalePrice}
                  onChange={handleFormChange}
                  placeholder="Wholesale Price"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="mb-2">Stock</Label>
              <Input
                name="stock"
                type="number"
                value={form?.stock}
                onChange={handleFormChange}
                placeholder="Stock"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {selectedProduct?.id ? "Update Product" : "Add Product"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
