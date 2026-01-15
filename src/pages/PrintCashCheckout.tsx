import { useCashSessionById } from "@/hooks/useCashSession";
import { useTransactionsByDay } from "@/hooks/useTransactions";
import { totalDailyCreditRevenue, totalDailyRevenue } from "@/lib/utils";
import { Route } from "@/routes/print-cash-checkout.$id";
import { useEffect } from "react";
import { Dot, Paper, RowText, Space, Text } from "react-receipt-slip";

const date = new Date();

const PrintCashCheckout = () => {
  const { id } = Route.useParams();
  const { data: cashSession, isLoading } = useCashSessionById(id);
  const { data: transactionsToday, isLoading: isLoadingToday } =
    useTransactionsByDay();

  useEffect(() => {
    const handleAfterPrint = () => {
      window.close();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoadingToday) window.print();
  }, [isLoading, isLoadingToday]);

  if (isLoading || isLoadingToday) {
    return <div>Loading...</div>;
  }

  const totalRevenue = totalDailyRevenue(transactionsToday || []);

  const totalCreditAmount = totalDailyCreditRevenue(transactionsToday || []);

  return (
    <Paper>
      <Text align="center" bold style={{ fontSize: 9 }}>
        Steel Colors and Metal Products
      </Text>
      <Text style={{ fontSize: 11 }} align="center" bold>
        Canteen
      </Text>
      <Text align="center" style={{ fontSize: 11 }}>
        Boalan, Zamboanga City{" "}
      </Text>
      <Text align="center" style={{ fontSize: 11 }}>
        {date.toDateString()} {date.toLocaleTimeString()}
      </Text>
      <Space size={[10, 10]} />
      <Dot />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />

      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Cashier:
        </Text>
        <Text style={{ fontSize: 11 }}>{cashSession?.user.name}</Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Opened at:
        </Text>
        <Text style={{ fontSize: 11 }}>
          {
            new Date(cashSession?.openedAt || "")
              .toISOString()
              .replace("T", " ")
              .replace("Z", "")
              .split(".")[0]
          }
        </Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Closed at:{" "}
        </Text>
        <Text style={{ fontSize: 11 }}>
          {cashSession?.closedAt
            ? new Date(cashSession?.closedAt || "")
                .toISOString()
                .replace("T", " ")
                .replace("Z", "")
                .split(".")[0]
            : "Not closed yet"}
        </Text>
      </RowText>

      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Dot />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Opening Cash
        </Text>
        <Text>₱{cashSession?.openingCash.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Cash Revenue
        </Text>
        <Text>₱{(totalRevenue - totalCreditAmount).toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Credit Revenue
        </Text>
        <Text>₱{totalCreditAmount.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Cash Checkout
        </Text>
        <Text>₱{cashSession?.closingCash.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold style={{ fontSize: 11 }}>
          Difference
        </Text>
        <Text>
          ₱
          {(
            cashSession?.closingCash -
            (totalRevenue - totalCreditAmount + cashSession?.openingCash)
          ).toFixed(2)}
        </Text>
      </RowText>

      <Dot />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />

      <Text align="center">_________________________________</Text>
      <Text align="center"> Signature</Text>

      <Space size={[10, 10]} />

      <Space size={[10, 10]} />
      <Dot />
      <Space size={[10, 10]} />
      <Text align="center" style={{ fontSize: 11 }}>
        This certifies that the following cash amount has been remitted at the
        end of the shift.
      </Text>
      <Space size={[10, 10]} />

      <Space size={[10, 10]} />
    </Paper>
  );
};

export default PrintCashCheckout;
