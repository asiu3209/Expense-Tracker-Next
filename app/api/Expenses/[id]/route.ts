import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateRequest } from "@/lib/auth-middleware";

// GET /api/expenses/[id]
// Fetch a single expense (only if it belongs to authenticated user)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }

  const { userId } = authResult;

  try {
    // Query with TWO conditions (AND):
    // 1. Expense ID matches the requested ID
    // 2. Expense belongs to the authenticated user
    const expense = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId) // CRITICAL: Verify ownership
        )
      );

    // If no expense found, either:
    // - The ID doesn't exist, OR
    // - The expense belongs to a different user
    // Either way, return 404 (don't reveal which)
    if (expense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense[0]);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id]
// Update an expense (only if it belongs to authenticated user)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }

  const { userId } = authResult;

  try {
    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    // SECURITY: Update with TWO conditions
    // This prevents updating expenses that belong to other users
    const updated = await db
      .update(expenses)
      .set({
        amount: amount?.toString(),
        category,
        description,
        date: date ? new Date(date) : undefined,
        receiptUrl,
        updatedAt: new Date(), // Track when the expense was last modified
      })
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId) // CRITICAL: Only update if user owns it
        )
      )
      .returning();

    // If nothing was updated, the expense either:
    // - Doesn't exist, OR
    // - Belongs to a different user
    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: "Expense not found or you do not have permission to update it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense updated successfully",
      expense: updated[0],
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id]
// Delete an expense (only if it belongs to authenticated user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  if (!authResult.authenticated) {
    return authResult.error;
  }

  const { userId } = authResult;

  try {
    // SECURITY: Delete with TWO conditions
    // This prevents deleting expenses that belong to other users
    const deleted = await db
      .delete(expenses)
      .where(
        and(
          eq(expenses.id, params.id),
          eq(expenses.userId, userId) // CRITICAL: Only delete if user owns it
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: "Expense not found or you do not have permission to delete it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense deleted successfully",
      expense: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
