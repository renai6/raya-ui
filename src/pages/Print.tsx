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
        Yusop Store
      </Text>
      <Text align="center" style={{ fontSize: 11 }}>
        Carmen, Southcom Village
      </Text>
      <Text align="center" style={{ fontSize: 11 }}>
        Zamboanga City
      </Text>
      <Text align="center" style={{ fontSize: 11 }}>
        {date.toDateString()} {date.toLocaleTimeString()}
      </Text>
      <Space size={[10, 10]} />
      <Dot />
      <Space size={[10, 10]} />
      {transaction?.sales.map((item: any) => (
        <div key={item.id}>
          <RowText style={{ fontSize: 11 }}>
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
        <Text bold style={{ fontSize: 11 }}>
          Total
        </Text>
        <Text>{transaction?.total.toFixed(2)}</Text>
      </RowText>
      <Space size={[5, 5]} />
      <Dot />
      <Space size={[5, 5]} />
      <RowText>
        <Text style={{ fontSize: 11 }}>Cash Received</Text>
        <Text>₱{transaction?.cashReceived.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text style={{ fontSize: 11 }}>Change</Text>
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
      <Text style={{ fontSize: 9 }} align="center">
        OR No: {transaction?.id}{" "}
      </Text>
      <Space size={[10, 10]} />
      <Dot />
      <Space size={[10, 10]} />
      <Text align="center" style={{ fontSize: 11 }}>
        This receipt is your proof of purchase. Merchandise received in good
        condition at Yusop Store
      </Text>
      <Space size={[10, 10]} />

      <Space size={[10, 10]} />
      <Text
        align="center"
        style={{ fontSize: 11, marginRight: 10, marginLeft: 10 }}
      >
        Please come again!
      </Text>
    </Paper>
  );
};
export default Print;
