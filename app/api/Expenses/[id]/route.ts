import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/expenses/[id] - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const expenseId = params.id;

    // Step 2: Query with TWO conditions (id AND userId)
    const expense = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.userId, userId) // Security: only return if owned by user
        )
      )
      .limit(1);

    // Step 3: Check if expense exists and belongs to user
    if (expense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ expense: expense[0] });
  } catch (error) {
    console.error("Get expense error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const expenseId = params.id;

    // Step 2: Get update data from request body
    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    // Step 3: Update with TWO conditions (id AND userId)
    const updated = await db
      .update(expenses)
      .set({
        ...(amount && { amount: amount.toString() }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(receiptUrl !== undefined && { receiptUrl }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.userId, userId) // Security: only update if owned by user
        )
      )
      .returning();

    // Step 4: Check if expense was found and updated
    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Expense not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense updated successfully",
      expense: updated[0],
    });
  } catch (error) {
    console.error("Update expense error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const expenseId = params.id;

    // Step 2: Delete with TWO conditions (id AND userId)
    const deleted = await db
      .delete(expenses)
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.userId, userId) // Security: only delete if owned by user
        )
      )
      .returning();

    // Step 3: Check if expense was found and deleted
    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Expense not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense deleted successfully",
      expense: deleted[0],
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
