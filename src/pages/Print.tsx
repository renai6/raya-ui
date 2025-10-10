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
    if (!isLoading) window.print();
    window.addEventListener("afterprint", handleAfterPrint);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Paper>
      <Text align="center" bold>
        Yusop Store
      </Text>
      <Text align="center">Southcom Village, Zamboanga City</Text>
      <Text align="center">TIN: 339-795-473-0000</Text>
      <Text align="center">Mobile: 0956-930-3690</Text>
      <Text align="center">
        {date.toDateString()} {date.toLocaleTimeString()}
      </Text>
      <Space size={[20, 10]} />
      <Dot />
      {transaction?.sales.map((item: any) => (
        <>
          <RowText>
            <Text bold>{item.product.name}</Text>
            <Text>{(item.total * item.quantity).toFixed(2)}</Text>
          </RowText>
          <RowText style={{ fontSize: 11, marginRight: 30, marginLeft: 30 }}>
            <Text bold>{item.quantity} pcs</Text>
            <Text>@</Text>
            <Text>{item.total.toFixed(2)}</Text>
          </RowText>
        </>
      ))}
      <hr />
      <Space size={[5, 5]} />
      <RowText>
        <Text bold>Total</Text>
        <Text>{transaction?.total.toFixed(2)}</Text>
      </RowText>
      <Space size={[5, 5]} />
      <Dot />
      <RowText>
        <Text bold>Cash Received</Text>
        <Text>₱{transaction?.cashReceived.toFixed(2)}</Text>
      </RowText>
      <RowText>
        <Text bold>Change</Text>
        <Text>
          ₱{(transaction?.cashReceived - transaction?.total).toFixed(2)}
        </Text>
      </RowText>

      <Dot margin={[5, 0]} />
      <Space size={[10, 10]} />
      <Text align="center">
        Merchandise received in Good Condition at Yusop Store
      </Text>
      <Dot margin={[5, 0]} />
      <Text bold>OR No: {transaction?.id} </Text>
      <Space size={[10, 10]} />
      <Space size={[10, 10]} />
      <Text align="center">- THIS IS YOUR OFFICIAL INVOICE -</Text>
    </Paper>
  );
};
export default Print;
