import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;

    // Step 2: Get optional date range filters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build conditions
    const conditions = [eq(expenses.userId, userId)];

    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, new Date(endDate)));
    }

    // Step 3: Get overall statistics
    const overallStats = await db
      .select({
        totalSpent: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
        expenseCount: sql<number>`COUNT(*)::int`,
        avgExpense: sql<number>`COALESCE(AVG(CAST(${expenses.amount} AS DECIMAL)), 0)`,
        maxExpense: sql<number>`COALESCE(MAX(CAST(${expenses.amount} AS DECIMAL)), 0)`,
        minExpense: sql<number>`COALESCE(MIN(CAST(${expenses.amount} AS DECIMAL)), 0)`,
        receiptsCount: sql<number>`COUNT(CASE WHEN ${expenses.receiptUrl} IS NOT NULL THEN 1 END)::int`,
      })
      .from(expenses)
      .where(and(...conditions));

    // Step 4: Get spending by category
    const categoryBreakdown = await db
      .select({
        category: expenses.category,
        total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)::int`,
        avgAmount: sql<number>`AVG(CAST(${expenses.amount} AS DECIMAL))`,
      })
      .from(expenses)
      .where(and(...conditions))
      .groupBy(expenses.category)
      .orderBy(sql`SUM(CAST(${expenses.amount} AS DECIMAL)) DESC`);

    // Step 5: Calculate percentages
    const totalSpent = Number(overallStats[0]?.totalSpent || 0);

    const categoryBreakdownWithPercentages = categoryBreakdown.map((cat) => ({
      category: cat.category,
      total: Number(cat.total),
      count: cat.count,
      avgAmount: Number(cat.avgAmount).toFixed(2),
      percentage:
        totalSpent > 0
          ? ((Number(cat.total) / totalSpent) * 100).toFixed(2)
          : "0.00",
    }));

    return NextResponse.json({
      overview: {
        totalSpent: Number(overallStats[0]?.totalSpent || 0).toFixed(2),
        expenseCount: overallStats[0]?.expenseCount || 0,
        avgExpense: Number(overallStats[0]?.avgExpense || 0).toFixed(2),
        maxExpense: Number(overallStats[0]?.maxExpense || 0).toFixed(2),
        minExpense: Number(overallStats[0]?.minExpense || 0).toFixed(2),
        receiptsCount: overallStats[0]?.receiptsCount || 0,
        receiptsPercentage:
          overallStats[0]?.expenseCount > 0
            ? (
                ((overallStats[0]?.receiptsCount || 0) /
                  overallStats[0].expenseCount) *
                100
              ).toFixed(2)
            : "0.00",
      },
      categoryBreakdown: categoryBreakdownWithPercentages,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
