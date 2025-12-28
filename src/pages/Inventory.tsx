import Header from "@/components/header/Header";
import InventoryBarCode from "@/components/inventory/InventoryBarCode";

import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useProducts } from "@/hooks/useProducts";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useAuthUser } from "@/stores/authStore";
import type { Product } from "@/types";
import { useState, useEffect } from "react";
import AddProductDialog from "@/components/inventory/AddProductDialog";
import ProductsTable from "@/components/inventory/ProductsTable";

const Inventory = () => {
  const user = useAuthUser();
  const { data: productsData, isLoading } = useProducts();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const [isItemAddDialogOpen, setIsItemAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openAddProduct = () => {
    setIsItemAddDialogOpen(true);
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add API call for add/edit product here
    if (user?.role === "CASHIER") return;
    if (selectedProduct?.id) {
      updateProduct(form);
    } else {
      createProduct(form);
    }

    setIsItemAddDialogOpen(false);
    setForm({
      name: "",
      barcode: "",
      retailPrice: 0,
      wholesalePrice: 0,
      stock: 0,
    });
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
      />
    </div>
  );
};

export default Inventory;
