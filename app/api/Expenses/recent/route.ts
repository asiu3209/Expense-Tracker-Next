import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, gte, and, desc } from "drizzle-orm";
import { getDaysAgo, formatDateForAPI } from "@/lib/date-helpers";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;

    // Get expenses from last 7 days
    const sevenDaysAgo = getDaysAgo(7);

    const recentExpenses = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), gte(expenses.date, sevenDaysAgo)))
      .orderBy(desc(expenses.date))
      .limit(20);

    return NextResponse.json({
      expenses: recentExpenses,
      dateRange: {
        start: formatDateForAPI(sevenDaysAgo),
        end: formatDateForAPI(new Date()),
      },
    });
  } catch (error) {
    console.error("Get recent expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent expenses" },
      { status: 500 }
    );
  }
}
