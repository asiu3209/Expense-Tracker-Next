"use client";

import { useState } from "react";
import ExpenseCard from "../ExpenseCard/ExpenseCard";
import type {
  ExpenseCardProps,
  ExpenseCategory,
} from "../ExpenseCard/ExpenseCard";
import Link from "next/link";

// Type for expense data (reusing interface from ExpenseCard)
type Expense = ExpenseCardProps;
type FilterCategory = "All" | ExpenseCategory;

interface ExpenseListProps {
  expenses: Expense[];
  deleteExpense?: (id: string) => void;
}

function ExpenseList({ expenses, deleteExpense }: ExpenseListProps) {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("All");

  const filteredExpenses =
    filterCategory === "All"
      ? expenses
      : expenses.filter((expense) => expense.category === filterCategory);

  const filteredTotal = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="bg-white rounded-lg p-6 md:p-6 mb-8 shadow-md border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Expenses</h2>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Expenses</h1>
        <Link
          href="/Expenses/newExpense"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Expense
        </Link>
      </div>

      {/* Summary & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
        <p className="text-gray-800 font-semibold">
          Total: ${filteredTotal.toFixed(2)} ({filteredExpenses.length}{" "}
          {filteredExpenses.length === 1 ? "expense" : "expenses"})
        </p>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label
            htmlFor="category-filter"
            className="text-gray-700 font-medium"
          >
            Filter by category:
          </label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as FilterCategory)
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Expense Items / Empty State */}
      <div className="flex flex-col gap-4">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center mt-4">
            <p className="text-gray-600 text-lg font-medium mb-2">
              No expenses found.
            </p>
            <p className="text-gray-500 text-sm">
              Add some expenses to get started!
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              {...expense}
              onDelete={deleteExpense}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ExpenseList;
