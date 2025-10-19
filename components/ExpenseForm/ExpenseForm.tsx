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
  receipt?: string;
}

interface ExpenseFormProps {
  onSubmit: (expenseData: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    receiptUrl?: string;
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

  //Stores receipt info until submitted as a file
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
    setUploading(true); // Disable button, show "Uploading..." text
    const amount = parseFloat(formData.amount);
    try {
      let receiptUrl: string | undefined;
      if (receipt) {
        const receiptFormData = new FormData();
        receiptFormData.append("receipt", receipt);
        const uploadResponse = await fetch("/api/uploadReceipt", {
          method: "POST",
          body: receiptFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload receipt");
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.url;
      }

      await fetch("/api/Expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description.trim(),
          amount,
          category: formData.category,
          date: formData.date,
          receiptUrl: receiptUrl,
        }),
      });
    } catch (error) {
      console.error("Submission error: ", error);
    } finally {
      // Ensures button re-enables so user can try again
      setUploading(false);
    }
  }

  /**
   * Handles receipt file selection from file input
   * Validates file type and size before storing in state
   */
  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Check if user selected a file
    // e.target.files is FileList (array-like) or null
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // VALIDATION 1: Check file type
      // file.type is MIME type: 'image/jpeg', 'image/png', etc.
      // .startsWith('image/') accepts any image type
      // Rejects: 'application/pdf', 'text/plain', 'video/mp4', etc.
      if (!file.type.startsWith("image/")) {
        // Set error message for user
        setErrors((prev) => ({
          ...prev,
          receipt: "Please select an image file (JPG, PNG, GIF)",
        }));
        // Clear selected file
        setReceipt(null);
        return; // Stop here, don't proceed
      }

      // VALIDATION 2: Check file size
      // file.size is in bytes
      // 5MB = 5 * 1024 KB = 5 * 1024 * 1024 bytes = 5,242,880 bytes
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        setErrors((prev) => ({
          ...prev,
          receipt: "File size must be less than 5MB",
        }));
        setReceipt(null);
        return;
      }

      // File is valid! Store it in state
      setReceipt(file);

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, receipt: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate before submitting
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop submission
    }

    // Parse amount safely
    const amount = parseFloat(formData.amount);

    processData();

    //Reset all form information, receipt info, and errors
    setFormData({
      description: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setReceipt(null);
    setErrors({});

    router.push("/Expenses");
    router.refresh();
  }

  return (
    <form
      className="bg-white rounded-lg p-6 mt-8 mb-8 shadow-sm border border-gray-200 w-full max-w-[60%] mx-auto"
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
        ${errors.date ? "border-red-300 focus:ring-red-500" : "border-gray-300"}
        `}
        />
        {errors.date && (
          <span className="text-red-500 text-xs mt-1 block">{errors.date}</span>
        )}
      </div>
      <div className="mb-6">
        <label
          htmlFor="receipt-input"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Receipt (Optional)
        </label>
        <div
          className={`w-full rounded-lg p-3 transition-colors duration-150 ${
            uploading
              ? "bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
              : "bg-white border-2 border-dashed border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            id="receipt-input"
            type="file"
            accept="image/*"
            onChange={handleReceiptChange}
            disabled={uploading}
            className="sr-only"
          />
          <label
            htmlFor="receipt-input"
            className={`flex items-center gap-3 cursor-pointer select-none ${
              uploading ? "pointer-events-none" : ""
            }`}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16v-4a4 4 0 018 0v4m-5-4v6m0 0h4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
                />
              </svg>
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {receipt ? receipt.name : "Click to upload a receipt"}
                </span>
                {receipt && (
                  <span className="text-xs text-gray-500 ml-2">
                    {(receipt.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              {!receipt && (
                <p className="text-xs text-gray-500 mt-0.5">
                  PNG, JPG, GIF up to 5MB
                </p>
              )}
            </div>

            <span
              aria-hidden
              className={`ml-3 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                uploading
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Browse
            </span>
          </label>
        </div>
        {receipt && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <span className="font-medium">{receipt.name}</span> (
            {(receipt.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {errors.receipt && (
          <span className="text-red-500 text-xs mt-1 block">
            {errors.receipt}
          </span>
        )}
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className={`w-full py-3 px-4 rounded-md font-medium ${
          uploading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {uploading ? "Uploading Receipt..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
