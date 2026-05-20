import Header from "@/components/header/Header";
import InventoryBarCode from "@/components/inventory/InventoryBarCode";

import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useAuthUser } from "@/stores/authStore";
import type { Product } from "@/types";

import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import AddProductDialog from "@/components/inventory/AddProductDialog";
import ProductsTable from "@/components/inventory/ProductsTable";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductMutations } from "@/hooks/useProductMutations";
import { Checkbox } from "@/components/ui/checkbox";

const Inventory = () => {
  const user = useAuthUser();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatePending } =
    useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeletePending } =
    useDeleteProduct();

  const { createBulkProducts } = useProductMutations();

  const [isItemAddDialogOpen, setIsItemAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [deletingBarcode, setDeletingBarcode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPriceExe, setIsPriceExe] = useState(false);
  const [isCreateProductsDialogOpen, setIsCreateProductsDialogOpen] =
    useState(false);
  const [fileUploaded, setFileUploaded] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openAddProduct = () => {
    setIsItemAddDialogOpen(true);
    setDeletingBarcode("");
    setIsDeleting(false);
  };

  const [form, setForm] = useState<Product>({
    name: "",
    barcode: "",
    retailPrice: 0,
    wholesalePrice: 0,
    stock: 0,
  });

  const setProduct = (product: Product) => {
    setSelectedProduct(product);
    setForm(product);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let numericValue = "";

    if (
      name === "retailPrice" ||
      name === "wholesalePrice" ||
      name === "stock"
    ) {
      // Allow only numbers and decimal point
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
      // Prevent multiple leading zeros
      if (value[0] === "0" && value.length > 1) {
        if (value[1] === ".") {
          numericValue = value;
        } else {
          numericValue = value.substring(1);
        }
      } else {
        numericValue = value;
      }
    }

    setForm((prev) => {
      const newValue = {
        ...prev,
        [name]:
          name === "retailPrice" ||
          name === "wholesalePrice" ||
          name === "stock"
            ? numericValue
            : value,
      };

      return newValue;
    });
  };

  const resetDialog = () => {
    setIsItemAddDialogOpen(false);
    setForm({
      name: "",
      barcode: "",
      retailPrice: 0,
      wholesalePrice: 0,
      stock: 0,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add API call for add/edit product here
    if (user?.role === "CASHIER") return;
    if (selectedProduct?.id) {
      updateProduct({
        ...form,
        retailPrice: Number(form.retailPrice),
        wholesalePrice: 0,
        stock: Number(form.stock),
      });
    } else {
      createProduct({
        ...form,
        retailPrice: Number(form.retailPrice),
        wholesalePrice: 0,
        stock: Number(form.stock),
      });
    }

    resetDialog();
  };

  const onDeleteProduct = (id: string | undefined) => {
    if (!id) return;
    if (deletingBarcode !== selectedProduct?.barcode) return;
    if (user?.role === "CASHIER") return;
    deleteProduct(id);

    resetDialog();

    toast.success("Product deleted successfully!");
  };

  const onItemClick = (product: Product) => {
    if (user?.role === "CASHIER") return;
    setSelectedProduct(product);
    setForm(product);
    setIsItemAddDialogOpen(true);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setFileUploaded(jsonData as any[]);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!fileUploaded || fileUploaded.length === 0) return;

    // Assuming first row is headers, skip it
    const products = fileUploaded.slice(1).map((row: any[]) => ({
      name: row[0]?.toString() || "",
      barcode: row[1]?.toString() || "",
      retailPrice: Number(row[2]) || 0,
      stock: Number(row[3]) || 0,
      wholesalePrice: 0,
    }));

    await createBulkProducts.mutate({ products, isPriceExe });

    setFileUploaded([]);
    setIsPriceExe(false);
    setIsCreateProductsDialogOpen(false);

    toast.success("Bulk products created successfully!");
  };

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Barcode", "Retail Price", "Stock"];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductsTemplate");
    XLSX.writeFile(workbook, "ProductsTemplate.xlsx");

    toast.success("Template downloaded successfully!");
  };

  if (isLoading) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Products Data</h2>
      </div>
    );
  }
  // Filter products based on search term
  // This is a simple client-side filter; for large datasets, consider server-side filtering
  const filteredProducts = Array.isArray(productsData?.products)
    ? productsData.products.filter((product: Product) =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
    : [];

  return (
    <div>
      <Header title="Inventory Management" user={{ email: user?.email }} />
      {user?.role === "ADMIN" && (
        <InventoryBarCode
          products={productsData.products || []}
          setProduct={setProduct}
          openAddProduct={openAddProduct}
        />
      )}

      <ProductsTable
        setIsCreateProductsDialogOpen={setIsCreateProductsDialogOpen}
        products={filteredProducts}
        onItemClick={onItemClick}
        setSearchTerm={setSearchTerm}
      />

      <AddProductDialog
        isItemAddDialogOpen={isItemAddDialogOpen}
        setIsItemAddDialogOpen={setIsItemAddDialogOpen}
        form={form}
        selectedProduct={selectedProduct}
        handleFormSubmit={handleFormSubmit}
        handleFormChange={handleFormChange}
        onDeleteProduct={onDeleteProduct}
        deletingBarcode={deletingBarcode}
        setDeletingBarcode={setDeletingBarcode}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        isCreatePending={isCreatePending}
        isUpdatePending={isUpdatePending}
        isDeletePending={isDeletePending}
      />

      <Dialog
        open={isCreateProductsDialogOpen}
        onOpenChange={setIsCreateProductsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Products</DialogTitle>
            <DialogDescription className="flex gap-2 flex-col">
              <span>
                Import products in bulk using a CSV file. To avoid errors,
                please use the provided template and follow the required format.
              </span>
              <span
                className="text-amber-500 cursor-pointer font-semibold underline"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid items-center gap-3 py-4">
              <Label htmlFor="excel">
                Upload Excel File with Products Data
              </Label>
              <Input
                onChange={handleUpload}
                id="excel"
                type="file"
                accept=".xlsx,.xls"
              />
              <div className="flex flex-col items-start gap-3 border p-4 rounded-md border-amber-500">
                <div className="flex gap-2">
                  <Checkbox
                    id="prices-check"
                    checked={isPriceExe}
                    onCheckedChange={(e) => setIsPriceExe(e as boolean)}
                  />
                  <Label htmlFor="prices-check">Apply prices</Label>
                </div>

                <p className="text-muted-foreground text-sm">
                  When checked, prices for existing products will be updated
                  based on the template.
                </p>
              </div>
              <Button onClick={handleImport}>
                {createBulkProducts.isPending ? (
                  <>
                    <Spinner />
                    Processing
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
