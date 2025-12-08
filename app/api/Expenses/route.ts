import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, inArray, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;

    // Step 2: Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categories = searchParams.get("categories"); // Comma-separated: "Food,Transportation"
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Step 3: Build conditions array
    const conditions = [eq(expenses.userId, userId)];

    // Add date range filter
    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, new Date(endDate)));
    }

    // Add category filter
    if (categories) {
      const categoryArray = categories.split(",").map((c) => c.trim());
      conditions.push(inArray(expenses.category, categoryArray));
    }

    // Add amount range filter
    if (minAmount) {
      conditions.push(sql`CAST(${expenses.amount} AS DECIMAL) >= ${minAmount}`);
    }
    if (maxAmount) {
      conditions.push(sql`CAST(${expenses.amount} AS DECIMAL) <= ${maxAmount}`);
    }

    // Step 4: Calculate pagination
    const offset = (page - 1) * limit;

    // Step 5: Query with all filters
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date))
      .limit(limit)
      .offset(offset);

    // Step 6: Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses)
      .where(and(...conditions));

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      expenses: userExpenses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// Keep existing POST function unchanged
export async function POST(request: NextRequest) {
  // ... existing code from Week 9 ...
}
