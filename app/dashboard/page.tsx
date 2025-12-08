"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserInfo, authenticatedFetch } from "@/lib/auth";
import FilterPanel from "@/components/FilterPanel/FilterPanel";
import Analytics from "@/components/Analytics/Analytics";

interface Expense {
  id: string;
  userId: string;
  amount: string;
  category: string;
  description: string | null;
  date: string;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  categories: string[];
  minAmount: string;
  maxAmount: string;
}

interface PaginationState {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentView, setCurrentView] = useState<"expenses" | "analytics">(
    "expenses"
  );

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    categories: [],
    minAmount: "",
    maxAmount: "",
  });
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    categories: [],
    minAmount: "",
    maxAmount: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    const userInfo = getUserInfo();
    setUser(userInfo);
    fetchExpenses();
  }, [router, activeFilters, pagination.page]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (activeFilters.startDate)
        params.append("startDate", activeFilters.startDate);
      if (activeFilters.endDate)
        params.append("endDate", activeFilters.endDate);
      if (activeFilters.categories.length > 0) {
        params.append("categories", activeFilters.categories.join(","));
      }
      if (activeFilters.minAmount)
        params.append("minAmount", activeFilters.minAmount);
      if (activeFilters.maxAmount)
        params.append("maxAmount", activeFilters.maxAmount);

      const response = await authenticatedFetch(
        `/api/expenses?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setReceipt(null);
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setFormError("Please upload a valid image file (PNG, JPG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("File size must be less than 5MB");
      return;
    }

    setFormError("");
    setReceipt(file);
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("receipt", file);

    const response = await authenticatedFetch("/api/upload-receipt", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to upload receipt");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setUploading(true);

    try {
      let receiptUrl = null;
      if (receipt) {
        receiptUrl = await uploadReceipt(receipt);
      }

      const response = await authenticatedFetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          receiptUrl: receiptUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFormError(data.error || "Failed to create expense");
        setUploading(false);
        return;
      }

      // Success! Reset form and refresh
      setFormData({
        amount: "",
        category: "Food",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setReceipt(null);
      setShowForm(false);
      setUploading(false);

      // Reset to page 1 and refresh
      setPagination({ ...pagination, page: 1 });
      fetchExpenses();
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred");
      setUploading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to page 1 when filters change
  };

  const handleResetFilters = () => {
    setActiveFilters({
      startDate: "",
      endDate: "",
      categories: [],
      minAmount: "",
      maxAmount: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          {user && (
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
          )}
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setCurrentView("expenses")}
            className={`px-4 py-2 font-medium rounded-md transition ${
              currentView === "expenses"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setCurrentView("analytics")}
            className={`px-4 py-2 font-medium rounded-md transition ${
              currentView === "analytics"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Conditional Rendering Based on View */}
        {currentView === "expenses" ? (
          <>
            {/* Add Expense Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
              >
                {showForm ? "Cancel" : "+ Add Expense"}
              </button>
            </div>

            {/* Add Expense Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  New Expense
                </h3>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Lunch with team"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="receipt-input"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Receipt (Optional)
                    </label>
                    <input
                      type="file"
                      id="receipt-input"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    />
                    {receipt && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected:{" "}
                        <span className="font-medium">{receipt.name}</span> (
                        {(receipt.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={uploading}
                      className={`px-4 py-2 font-medium rounded-md transition ${
                        uploading
                          ? "bg-gray-300 cursor-not-allowed text-gray-600"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {uploading ? "Uploading Receipt..." : "Add Expense"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setReceipt(null);
                        setFormError("");
                      }}
                      disabled={uploading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter Panel */}
            <FilterPanel
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {/* Expenses List Header */}
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Your Expenses
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {expenses.length} of {pagination.totalCount} expense
                  {pagination.totalCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Expenses List */}
            {expenses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">
                  {activeFilters.startDate ||
                  activeFilters.endDate ||
                  activeFilters.categories.length > 0
                    ? "No expenses match your filters."
                    : "No expenses yet. Start tracking your spending!"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {expense.category}
                        </p>
                        {expense.description && (
                          <p className="text-sm text-gray-600">
                            {expense.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-lg font-bold text-green-600">
                          ${parseFloat(expense.amount).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {expense.receiptUrl && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-3">
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View Receipt</span>
                          </a>
                          <span className="text-xs text-gray-500">
                            • Attached
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-4 py-2 font-medium rounded-md transition ${
                    pagination.hasPreviousPage
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className={`px-4 py-2 font-medium rounded-md transition ${
                    pagination.hasNextPage
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Analytics View */
          <Analytics
            filters={{
              startDate: activeFilters.startDate,
              endDate: activeFilters.endDate,
            }}
          />
        )}
      </main>
    </div>
  );
}
