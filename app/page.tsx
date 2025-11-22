"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BG from "@/assets/ExpenseBackground.jpg";
import { isAuthenticated, signOut, authenticatedFetch } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    if (!isAuthenticated()) {
      setSignedIn(false);
      setLoading(false); // Show welcome page
      return;
    }

    // User is signed in - fetch expenses
    setSignedIn(true);
    loadExpenses();
  }, [router]);

  async function loadExpenses() {
    try {
      const response = await authenticatedFetch("/api/expenses");
      if (!response.ok) {
        console.error("Failed to fetch expenses");
        signOut();
        setSignedIn(false);
        return;
      }
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
      setSignedIn(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    signOut();
    setSignedIn(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // User not signed in - show welcome page
  if (!signedIn) {
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
              Track your expenses with ease. Please sign in to view your
              expenses.
            </p>
            <div className="flex justify-center">
              <Link
                href="/signin"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-semibold shadow"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // User signed in - show expenses
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>

        {expenses.length === 0 ? (
          <p className="text-gray-600">No expenses yet. Start tracking!</p>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {expenses.map((expense: any) => (
              <div
                key={expense.id}
                className="p-4 border-b last:border-b-0 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ${expense.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
