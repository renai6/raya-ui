import { useTransaction } from "@/hooks/useTransaction";
import { Route } from "@/routes/print.$id";
import { useEffect } from "react";
import { Dot, Paper, RowText, Space, Text } from "react-receipt-slip";

const date = new Date();

const Print = () => {
  const { id } = Route.useParams();
  const { data: transaction, isLoading } = useTransaction(id);

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
    if (!isLoading) window.print();
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Paper>
      <Text align="center" bold>
        Steel Colors and Metal Products
      </Text>
      <Text align="center" bold>
        Canteen
      </Text>
      <Text align="center">Test Morning Glory, Putik, ZC </Text>
      <Text align="center">TIN: 000-000-000-0000</Text>
      <Text align="center">Mobile: 0000-000-0000</Text>
      <Text align="center">
        {date.toDateString()} {date.toLocaleTimeString()}
      </Text>
      <Space size={[20, 10]} />
      <Dot />
      {transaction?.sales.map((item: any) => (
        <div key={item.id}>
          <RowText>
            <Text bold>{item.product.name}</Text>
            <Text>{(item.total * item.quantity).toFixed(2)}</Text>
          </RowText>
          <RowText style={{ fontSize: 11, marginRight: 30, marginLeft: 30 }}>
            <Text bold>{item.quantity} pcs</Text>
            <Text>@</Text>
            <Text>{item.total.toFixed(2)}</Text>
          </RowText>
        </div>
      ))}
      <hr />
      <Space size={[5, 5]} />
      <RowText>
        <Text bold>Total</Text>
        <Text>{transaction?.total.toFixed(2)}</Text>
      </RowText>
      <Space size={[5, 5]} />
      <Dot />
      <Space size={[5, 5]} />
      <RowText>
        <Text bold>Cash Received</Text>
        <Text>₱{transaction?.cashReceived.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold>Change</Text>
        <Text>
          ₱
          {transaction?.cashReceived > 0
            ? (transaction?.cashReceived - transaction?.total).toFixed(2)
            : "0.00"}
        </Text>
      </RowText>
      <Space size={[5, 5]} />
      <Dot />
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Text align="center">
        {transaction?.cashReceived === 0
          ? "Transaction recorded as credit"
          : ""}
      </Text>
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      {transaction?.cashReceived === 0 && (
        <>
          <Text align="center">{transaction?.employee?.name}</Text>
          <Text align="center">_________________________________</Text>
          <Text align="center">Employee's Signature</Text>
        </>
      )}

      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Text align="center" bold>
        OR No: {transaction?.id}{" "}
      </Text>
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Text align="center">THIS IS YOUR OFFICIAL INVOICE</Text>
    </Paper>
  );
};
export default Print;
