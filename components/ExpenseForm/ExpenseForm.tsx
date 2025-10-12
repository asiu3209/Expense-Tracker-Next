"use client";

import React, { useState } from "react";
import type { ExpenseCategory } from "../ExpenseCard/ExpenseCard";
import { useRouter } from "next/navigation";

// Form data interface
interface ExpenseFormData {
  description: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

interface ExpenseFormProps {
  onSubmit: (expenseData: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
  }) => void;
}

function ExpenseForm() {
  //Router that will help with changing which page is user on
  const router = useRouter();

  // Form state using controlled components pattern
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });

  // Track validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation function
  function validateForm(info: ExpenseFormData): FormErrors {
    const validationErrors: FormErrors = {};
    if (!info.description.trim()) {
      validationErrors.description = "An expense description is required.";
    }
    if (!info.amount || parseFloat(info.amount) <= 0) {
      validationErrors.amount = "Amount must be greater than 0.";
    }
    if (!info.date) {
      validationErrors.date = "Date is required.";
    }
    if (!info.category) {
      validationErrors.category = "Category is required.";
    }
    return validationErrors;
  }

  //Calls API route and function POST to add a new expense into the data
  async function processData() {
    const amount = parseFloat(formData.amount);
    await fetch("/api/Expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: formData.description.trim(),
        amount,
        category: formData.category,
        date: formData.date,
      }),
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validate before submitting
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop submission
    }

    // Parse amount safely
    const amount = parseFloat(formData.amount);

    // Submit processed data
    // onSubmit({
    //   description: formData.description.trim(),
    //   amount,
    //   category: formData.category,
    //   date: formData.date,
    // });
    processData();
    // Reset form + errors
    setFormData({
      description: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setErrors({});

    router.push("/Expenses");
  };

  return (
    <form
      className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200"
      onSubmit={handleSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-5">
        Add New Expense
      </h3>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Description *
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="What did you spend money on?"
          className={`
            w-full px-3 py-2.5 
            border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400 text-sm bg-white
            transition-colors duration-200
            ${
              errors.description
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }
          `}
        />
        {errors.description && (
          <span className="text-red-500 text-xs mt-1 block">
            {errors.description}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`
              w-full px-3 py-2.5 
              border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-400 text-sm bg-white
              transition-colors duration-200
              ${
                errors.amount
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }
            `}
          />
          {errors.amount && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.amount}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as ExpenseCategory,
              })
            }
            className={`
              w-full px-3 py-2.5 
              border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-sm bg-white cursor-pointer
              transition-colors duration-200
              ${
                errors.category
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }
            `}
          >
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.category}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`
            w-full px-3 py-2.5 
            border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-sm bg-white
            transition-colors duration-200
            ${
              errors.date
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }
          `}
        />
        {errors.date && (
          <span className="text-red-500 text-xs mt-1 block">{errors.date}</span>
        )}
      </div>

      <button
        type="submit"
        className="
          w-full bg-blue-500 hover:bg-blue-600 
          text-white font-medium py-3 px-4 
          rounded-md transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
