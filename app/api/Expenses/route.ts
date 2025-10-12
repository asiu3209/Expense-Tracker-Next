import { NextResponse } from "next/server";

let expenses = [
  {
    id: "1",
    description: "Lunch at downtown cafe",
    amount: 12.5,
    category: "Food",
    date: "2024-01-15",
  },
  {
    id: "2",
    description: "Monthly bus pass",
    amount: 95.0,
    category: "Transportation",
    date: "2024-01-14",
  },
];

export async function GET() {
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate required fields
    if (!body.description || !body.amount || !body.category || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newExpense = {
      id: Date.now().toString(),
      description: body.description,
      amount: body.amount,
      category: body.category,
      date: body.date,
    };

    expenses.push(newExpense);

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    // If no ID provided
    if (!id) {
      return NextResponse.json(
        { error: "Missing expense ID" },
        { status: 400 }
      );
    }

    // Filter out the expense with the given ID
    expenses = expenses.filter((expense) => expense.id !== id);

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
