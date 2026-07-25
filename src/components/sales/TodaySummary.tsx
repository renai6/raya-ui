import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HandCoins, SquareMenu } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TodaySummaryProps {
  cashSession: {
    id?: string;
    openingCash?: number;
    borrowedCash?: number;
  } | null;
  totalRevenue: number;
  totalCreditAmount: number;
  expectedCash: number;
  setIsBorrowCashDialogOpen: (open: boolean) => void;
  setIsCashCheckoutDialogOpen: (open: boolean) => void;
}

const TodaySummary = ({
  cashSession,
  totalRevenue,
  totalCreditAmount,
  expectedCash,
  setIsBorrowCashDialogOpen,
  setIsCashCheckoutDialogOpen,
}: TodaySummaryProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full" asChild>
        <Button variant="ghost" className="w-full text-amber-500">
          Today's Summary
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="shadow-card mt-2">
          <CardContent className="flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2">
              <SquareMenu className="w-4 text-amber-500" />
              <span>Today's Summary</span>
            </h2>
            <div className="flex align-items-center gap-2">
              <Button
                variant="outline"
                size={"sm"}
                onClick={() => setIsBorrowCashDialogOpen(true)}
              >
                <HandCoins className="w-4" />
                Borrow Cash
              </Button>
              <Button
                size={"sm"}
                onClick={() => setIsCashCheckoutDialogOpen(true)}
              >
                <HandCoins className="w-4" />
                Cash Checkout
              </Button>
            </div>
          </CardContent>
          <CardHeader className="space-x-4">
            <div className="flex w-full">
              <div className="w-full space-y-3">
                <div>
                  <CardDescription>Opening Cash</CardDescription>
                  <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(cashSession?.openingCash || 0)}
                  </CardTitle>
                </div>
                <div>
                  <CardDescription>Cash Revenue</CardDescription>
                  <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(totalRevenue - totalCreditAmount)}
                  </CardTitle>
                </div>
                <div>
                  <CardDescription>Borrowed Cash</CardDescription>
                  <CardTitle className="text-red-400 ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(cashSession?.borrowedCash || 0)}
                  </CardTitle>
                </div>
                <div>
                  <CardDescription>Credit Revenue</CardDescription>
                  <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(totalCreditAmount)}
                  </CardTitle>
                </div>
                <div>
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="ml-2 text-md font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(totalRevenue)}
                  </CardTitle>
                </div>
              </div>
              <div className="flex justify-center items-center w-full flex-col">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-medium">Expected Cash</h2>
                  <CardTitle className="text-md font-semibold tabular-nums @[250px]/card:text-3xl text-amber-500">
                    {formatCurrency(expectedCash)}
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TodaySummary;
