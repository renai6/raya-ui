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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Product } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  isItemAddDialogOpen: boolean;
  setIsItemAddDialogOpen: (open: boolean) => void;
  form: {
    name: string;
    barcode: string;
    retailPrice: number;
    wholesalePrice?: number;
    stock: number;
  };
  selectedProduct: Product | null;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteProduct: (id: string | undefined) => void;
  deletingBarcode: string;
  setDeletingBarcode: (barcode: string) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
};

const AddProductDialog = (props: Props) => {
  const {
    isItemAddDialogOpen,
    setIsItemAddDialogOpen,
    form,
    selectedProduct,
    handleFormSubmit,
    handleFormChange,
    onDeleteProduct,
    deletingBarcode,
    setDeletingBarcode,
    isDeleting,
    setIsDeleting,
    isCreatePending,
    isUpdatePending,
    isDeletePending,
  } = props;

  return (
    <Dialog open={isItemAddDialogOpen} onOpenChange={setIsItemAddDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedProduct?.id ? "Edit" : "Add"} Product
          </DialogTitle>
          <DialogDescription>
            Product {selectedProduct?.id ? "update" : "creation"} form.
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
                disabled={isDeleting}
              />
            </div>
            <div>
              <Label className="mb-2">Barcode</Label>
              <Input
                name="barcode"
                value={form?.barcode}
                onChange={handleFormChange}
                placeholder="Barcode"
                required
              />
            </div>
            <div>
              <Label className="mb-2">Retail Price</Label>
              <Input
                name="retailPrice"
                type="number"
                step="0.01"
                value={form?.retailPrice}
                onChange={handleFormChange}
                placeholder="Retail Price"
                required
                disabled={isDeleting}
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
            <div>
              <Label className="mb-2">Stock</Label>
              <Input
                name="stock"
                type="number"
                value={form?.stock}
                onChange={handleFormChange}
                placeholder="Stock"
                required
                disabled={isDeleting}
              />
            </div>
            {isDeleting ? null : (
              <Button
                type="submit"
                className="w-full"
                disabled={isCreatePending || isUpdatePending}
              >
                {selectedProduct?.id ? "Update Product" : "Add Product"}
              </Button>
            )}
          </form>
          {selectedProduct?.id && (
            <Collapsible open={isDeleting} onOpenChange={setIsDeleting}>
              <CollapsibleTrigger className="w-full" asChild>
                <Button variant="ghost" className="w-full text-red-300">
                  {isDeleting ? "Hide" : "Delete Product"}{" "}
                  {isDeleting ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 border border-red-600 rounded-sm mt-4">
                  <h3 className="text-red-500 text-bold">Danger Zone</h3>
                  <small className="text-gray-300">
                    Please be careful deleting. Deleting a product cannot be
                    undone.
                  </small>

                  <div>
                    <Label className="mb-2 mt-4">
                      Please enter the barcode of the product you want to delete
                    </Label>
                    <Input
                      onChange={(e) => setDeletingBarcode(e.target.value)}
                    />
                  </div>

                  <Button
                    className="mt-3 w-full"
                    variant="destructive"
                    onClick={() => onDeleteProduct(selectedProduct.id)}
                    disabled={
                      deletingBarcode !== selectedProduct.barcode ||
                      isDeletePending
                    }
                  >
                    Delete Product
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
