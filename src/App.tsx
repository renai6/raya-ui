import { Link } from "@tanstack/react-router";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-2xl font-bold mb-4">
        Welcome to <span className="text-amber-500">RAYA</span>
      </p>
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
