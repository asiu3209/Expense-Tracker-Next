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

    // Step 2: Get year parameter (default to current year)
    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    // Step 3: Get spending grouped by month
    const monthlyData = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.date})::int`,
        total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, new Date(`${year}-01-01`)),
          lte(expenses.date, new Date(`${year}-12-31`))
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${expenses.date})`);

    // Step 4: Initialize all 12 months with zero
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const report = monthNames.map((name, index) => {
      const monthNum = index + 1;
      const data = monthlyData.find((m) => m.month === monthNum);

      return {
        month: monthNum,
        monthName: name,
        total: data ? Number(data.total).toFixed(2) : "0.00",
        count: data ? data.count : 0,
      };
    });

    // Step 5: Calculate year totals
    const yearTotal = report.reduce(
      (sum, month) => sum + parseFloat(month.total),
      0
    );
    const yearCount = report.reduce((sum, month) => sum + month.count, 0);

    return NextResponse.json({
      year,
      months: report,
      yearTotals: {
        total: yearTotal.toFixed(2),
        count: yearCount,
        avgPerMonth: (yearTotal / 12).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Monthly report error:", error);
    return NextResponse.json(
      { error: "Failed to generate monthly report" },
      { status: 500 }
    );
  }
}
