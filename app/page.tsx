import Link from "next/link";
import BG from "@/assets/ExpenseBackground.jpg";

// Home page of expense tracker
export default function HomePage() {
  return (
    <main
      className="min-h-screen p-8 relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${BG.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white/80 rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Expense Tracker
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
            Welcome!
          </h2>
          <p className="text-gray-700 mb-6 text-center">
            Track your expenses with ease. Get started by viewing your expenses.
          </p>
          <div className="flex justify-center">
            <Link
              href="/Expenses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-semibold shadow"
            >
              View Expenses
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
