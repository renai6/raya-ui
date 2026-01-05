import { Link } from "@tanstack/react-router";
import { useAuthUser } from "./stores/authStore";

function App() {
  const user = useAuthUser();
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <div className="flex flex-col items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Welcome, {user?.email || "User"}!</h2>
      </div>
      <Link
        to="/login"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-green-600 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}

export default App;
