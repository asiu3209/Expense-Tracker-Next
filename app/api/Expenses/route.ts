import { NextResponse } from "next/server";

//Current Storage of expense information, database will be implemented
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

//Returns the expenses array to whoever asked for it in JSON form
export async function GET() {
  return NextResponse.json(expenses);
}

//Adds a new expense into the array, returns error codes when problems occur
export async function POST(request: Request) {
  try {
    //Obtains information, such as expense info, from called function
    const body = await request.json();
    // Validate required fields
    if (!body.description || !body.amount || !body.category || !body.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    //New expense created using form data
    const newExpense = {
      id: Date.now().toString(),
      description: body.description,
      amount: body.amount,
      category: body.category,
      date: body.date,
    };

    expenses.push(newExpense);
    //Returns success code
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    //Handles errors
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
//Deletes a provided expense from storage based off of an expense ID given
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
