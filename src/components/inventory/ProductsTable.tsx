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
import type { Product } from "@/types";

type Props = {
  products: Product[];
  setSearchTerm: (term: string) => void;
  onItemClick: (product: Product) => void;
};

const ProductsTable = (props: Props) => {
  const { products, setSearchTerm, onItemClick } = props;
  return (
    <Card className="mt-3 mb-4 gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)] border-none">
      <CardHeader>
        <CardTitle className="flex flex-col gap-3">
          <span>Product List</span>
          <small className="text-amber-500">
            A list of your recent products which are low in stocks
          </small>
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
