import Header from "@/components/header/Header";
import InventoryBarCode from "@/components/inventory/InventoryBarCode";

import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useAuthUser } from "@/stores/authStore";
import type { Product } from "@/types";
import { useState, useEffect } from "react";
import AddProductDialog from "@/components/inventory/AddProductDialog";
import ProductsTable from "@/components/inventory/ProductsTable";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const Inventory = () => {
  const user = useAuthUser();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatePending } =
    useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeletePending } =
    useDeleteProduct();

  const [isItemAddDialogOpen, setIsItemAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [deletingBarcode, setDeletingBarcode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
        wholesalePrice: Number(form.wholesalePrice),
        stock: Number(form.stock),
      });
    } else {
      createProduct({
        ...form,
        retailPrice: Number(form.retailPrice),
        wholesalePrice: Number(form.wholesalePrice),
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
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
    </div>
  );
};

export default Inventory;
