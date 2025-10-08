import { ShoppingCart } from "lucide-react";

type Props = {
  user: {
    email: string;
  };
  title: string;
};

const Header = ({ user, title }: Props) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-900 rounded-sm flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold">{title}</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm">Cashier: {user?.email}</p>
          <p className="text-sm">{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
