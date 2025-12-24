import Header from "@/components/header/Header";
import InventoryBarCode from "@/components/inventory/InventoryBarCode";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useProducts } from "@/hooks/useProducts";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import { useAuthUser } from "@/stores/authStore";
import type { Product } from "@/types";
import { useState } from "react";

const Inventory = () => {
  const [page, setPage] = useState(1);
  const user = useAuthUser();
  const { data: productsData, isLoading } = useProducts(page);
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const [isItemAddDialogOpen, setIsItemAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const openAddProduct = () => {
    setIsItemAddDialogOpen(true);
  };

  const onPageChange = (newPage: number) => {
    if (newPage === 0 || productsData.count < (newPage - 1) * 10) return;
    setPage(newPage);
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
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
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

      <Card className="mt-3 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 justify-between">
            <span>Product List</span>
            <Button variant="secondary" type="submit" size="sm">
              <RefreshCcw className="w-5 h-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search products..."
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                <TableHead className="text-right">Wholesal Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: Product) => (
                <TableRow
                  key={product.id}
                  onClick={() => onItemClick(product)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">
                    {product.retailPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.wholesalePrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  role="button"
                  onClick={() => onPageChange(page - 1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  role="button"
                  onClick={() => onPageChange(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
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
    </div>
  );
};

export default Inventory;
