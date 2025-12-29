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

const Inventory = () => {
  const user = useAuthUser();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

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
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "retailPrice" || name === "wholesalePrice" || name === "stock"
          ? Number(value)
          : value,
    }));
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
      updateProduct(form);
    } else {
      createProduct(form);
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
    return <div>Loading...</div>;
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
      />
    </div>
  );
};

export default Inventory;
