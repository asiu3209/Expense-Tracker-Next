"use client";

import { useState, useEffect } from "react";
import ExpenseSummary from "@/components/ExpenseSummary/ExpenseSummary";
import ExpenseList from "@/components/ExpenseList/ExpenseList";
import type { ExpenseCategory } from "@/components/ExpenseCard/ExpenseCard";
import Login from "@/components/Login/Login";
import SignUp from "@/components/SignUp/SignUp";
import Link from "next/link";

// Type for expense data
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt?: string; //optional meta data
  updatedAt?: string; //tracking
  tags?: string[]; //future implementation
}

function App() {
  //Storage of expenses and used across all functions and components throughout application
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function fetchExpenses() {
    const response = await fetch("/api/Expenses");
    const data = await response.json();
    setExpenses(data);
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // function handleAddExpense(expenseData: Omit<Expense, "id">): void {
  //   const newExpense: Expense = {
  //     ...expenseData,
  //     id: Date.now().toString(),
  //   };
  //   setExpenses((prev) => [...prev, newExpense]);
  // }

  //Function deleted expense from routes api and reupdates list shown using fetchExpenses
  //This function is passed into Expense List and Expense List passes it into Expense Card
  async function handleDeleteExpense(id: string) {
    // Filter out the expense with the matching id
    await fetch("/api/Expenses", {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchExpenses();
  }
  //Obtains the sum of all expenses to be displayed inside expense summary
  const totalAmount = expenses.reduce(
    (sum: number, expense: Expense) => sum + expense.amount,
    0
  );

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full bg-slate-50">
      <div className="max-w-[1200px] mx-auto p-5 w-full">
        <main className="app-main">
          <ExpenseSummary
            totalAmount={totalAmount}
            expenseCount={expenses.length}
            period="This Month"
          />
          <ExpenseList
            expenses={expenses}
            deleteExpense={handleDeleteExpense}
          />
        </main>

        <Link
          href="/"
          className="flex justify-end mt-4 text-blue-500 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default App;
