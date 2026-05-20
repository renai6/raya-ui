import Header from "@/components/header/Header";
import TransactionsTable from "@/components/transaction/TransactionsTable";
import { Spinner } from "@/components/ui/spinner";
import { useInventoryTransactions } from "@/hooks/useInventoryTransactions";
import { useProducts } from "@/hooks/useProducts";
import { useAuthUser } from "@/stores/authStore";

const Transactions = () => {
  const user = useAuthUser();
  const { data: inventoryTransactions, isLoading } = useInventoryTransactions();
  const { data: products, isLoading: isProductsLoading } = useProducts();

  if (isLoading || isProductsLoading) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Transactions Data</h2>
      </div>
    );
  }

  return (
    <div>
      <Header title="Trasaction History" user={{ email: user?.email }} />

      <TransactionsTable
        inventoryTransactions={inventoryTransactions}
        products={products}
      />
    </div>
  );
};

export default Transactions;
