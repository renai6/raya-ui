import DataTable, { type Column } from "@/components/ui/data-table";
import SearchInput from "@/components/ui/search-input";
import SectionCard from "@/components/ui/section-card";
import * as XLSX from "xlsx";
import type { Product } from "@/types";
import { Button } from "../ui/button";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

type Props = {
  products: Product[];
  setSearchTerm: (term: string) => void;
  onItemClick: (product: Product) => void;
  setIsCreateProductsDialogOpen: (open: boolean) => void;
};

const LOW_STOCK_THRESHOLD = 10;

const columns: Column<Product>[] = [
  {
    key: "name",
    header: "Item",
    cell: (product) => product.name,
    className: "font-medium",
  },
  {
    key: "barcode",
    header: "Barcode",
    cell: (product) => product.barcode,
    className: "text-muted-foreground tabular-nums",
  },
  {
    key: "stock",
    header: "Quantity",
    align: "right",
    cell: (product) => (
      <span
        className={
          product.stock === 0
            ? "text-destructive"
            : product.stock < LOW_STOCK_THRESHOLD
              ? "text-primary"
              : undefined
        }
      >
        {product.stock}
      </span>
    ),
  },
  {
    key: "retailPrice",
    header: "Retail Price",
    align: "right",
    cell: (product) => formatCurrency(product.retailPrice),
  },
];

const ProductsTable = (props: Props) => {
  const { products, setSearchTerm, onItemClick } = props;

  const lowStockCount = products.filter(
    (product) => product.stock < LOW_STOCK_THRESHOLD,
  ).length;

  const handleExport = () => {
    const headers = ["Name", "Barcode", "Retail Price", "Stock", "Last Update"];
    const data = products.map((product) => [
      product.name,
      product.barcode,
      product.retailPrice,
      product.stock,
      product.updatedAt?.replace("T", " "),
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `inventory-report-${Date.now()}.xlsx`);
    toast.success("Products exported successfully!");
  };

  return (
    <SectionCard
      className="mt-4 mb-4"
      title="Product List"
      description={`${products.length} products, ${lowStockCount} low on stock`}
      actions={
        <>
          <Button
            variant="default"
            onClick={() => props.setIsCreateProductsDialogOpen(true)}
          >
            <Plus className="w-4" />
            Import Products
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4" />
            Export
          </Button>
        </>
      }
      toolbar={
        <SearchInput
          placeholder="Search products"
          onChange={setSearchTerm}
          className="max-w-sm"
        />
      }
    >
      <DataTable
        columns={columns}
        rows={products}
        rowKey={(product) => String(product.id)}
        onRowClick={onItemClick}
        emptyMessage="No products match this search. Import products to get started."
      />
    </SectionCard>
  );
};

export default ProductsTable;
