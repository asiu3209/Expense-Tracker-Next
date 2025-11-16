import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticateRequest } from "@/lib/auth-middleware";

// GET /api/expenses
// Fetch all expenses for the authenticated user
export async function GET(request: NextRequest) {
  // Step 1: Authenticate and get userId from token
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }

  // Step 2: Extract userId from verified token (TRUSTED source)
  const { userId } = authResult;

  try {
    // Step 3: Query database - CRITICAL: Filter by userId
    // This WHERE clause prevents users from seeing each other's data
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId)) // Only this user's expenses
      .orderBy(desc(expenses.date)); // Newest first

    // Step 4: Return the expenses
    return NextResponse.json({
      expenses: userExpenses,
      count: userExpenses.length,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses
// Create a new expense for the authenticated user
export async function POST(request: NextRequest) {
  // Step 1: Authenticate and get userId from token
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }

  // Step 2: Extract userId from verified token
  const { userId } = authResult;

  try {
    // Step 3: Get expense data from request body
    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    // Step 4: Validate required fields
    if (!amount || !category || !date) {
      return NextResponse.json(
        { error: "Amount, category, and date are required" },
        { status: 400 }
      );
    }

    // Step 5: Insert expense into database
    // SECURITY: Use userId from token, NOT from request body
    const newExpense = await db
      .insert(expenses)
      .values({
        userId, // From token - prevents creating expenses for other users
        amount: amount.toString(),
        category,
        description: description || null,
        date: new Date(date),
        receiptUrl: receiptUrl || null,
      })
      .returning(); // Return the inserted row

    // Step 6: Return the created expense
    return NextResponse.json(
      {
        message: "Expense created successfully",
        expense: newExpense[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
