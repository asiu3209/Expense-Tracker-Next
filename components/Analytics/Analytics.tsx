"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalSpent: string;
    expenseCount: number;
    avgExpense: string;
    maxExpense: string;
    minExpense: string;
    receiptsCount: number;
    receiptsPercentage: string;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
    avgAmount: string;
    percentage: string;
  }>;
}

interface AnalyticsProps {
  filters?: {
    startDate?: string;
    endDate?: string;
  };
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

export default function Analytics({ filters }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await authenticatedFetch(
        `/api/expenses/analytics?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const chartData = data.categoryBreakdown.map((cat) => ({
    name: cat.category,
    value: cat.total,
  }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">
            ${data.overview.totalSpent}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.overview.expenseCount}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Average Expense</p>
          <p className="text-2xl font-bold text-gray-900">
            ${data.overview.avgExpense}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">With Receipts</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.overview.receiptsCount} ({data.overview.receiptsPercentage}%)
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-12">
              No data to display
            </p>
          )}
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Details
          </h3>
          <div className="space-y-3">
            {data.categoryBreakdown.map((cat, index) => (
              <div
                key={cat.category}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{cat.category}</p>
                    <p className="text-sm text-gray-600">
                      {cat.count} expenses
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${cat.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
