import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  // Step 1: Authenticate
  const authResult = await authenticateRequest(request);

  // Step 2: Check for authentication errors
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Step 3: Extract userId (TRUSTED - came from verified token)
  const { userId, email, name } = authResult;

  // Step 4: Simulate fetching user-specific data
  // In a real app, this would be a database query filtered by userId
  const userData = {
    userId: userId,
    email: email,
    name: name,
    // This would come from the database in a real app:
    expenseCount: 5,
    totalSpent: 250.0,
    categories: ["Food", "Transportation", "Entertainment"],
  };

  // Step 5: Return data for THIS user only
  return NextResponse.json({
    message: "User-specific data retrieved successfully",
    data: userData,
  });
}
