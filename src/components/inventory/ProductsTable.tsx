import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import type { Product } from "@/types";
import { Button } from "../ui/button";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  products: Product[];
  setSearchTerm: (term: string) => void;
  onItemClick: (product: Product) => void;
  setIsCreateProductsDialogOpen: (open: boolean) => void;
};

const ProductsTable = (props: Props) => {
  const { products, setSearchTerm, onItemClick } = props;

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
    <Card className="mt-3 mb-4 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.75)] border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="mb-2">Product List</h1>
            <small className="text-amber-500">
              A list of your recent products
            </small>
          </div>
          <div className="flex gap-2">
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
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Input
          placeholder="Search products..."
          className="mb-4"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="max-h-100 overflow-auto pr-2 custom-scrollbar">
          <Table>
            <TableHeader className="dark:bg-neutral-800">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                <TableHead className="text-right">Wholesal Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: Product) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
