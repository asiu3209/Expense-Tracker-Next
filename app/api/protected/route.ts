import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  // Step 1: Authenticate the request
  const authResult = await authenticateRequest(request);

  // Step 2: Check if authentication failed
  if (authResult instanceof NextResponse) {
    // authenticateRequest returned an error response
    return authResult;
  }

  // Step 3: Authentication succeeded - use the authenticated user data
  const { userId, email, name } = authResult;

  // Step 4: Return protected data
  return NextResponse.json({
    message: "This is protected data",
    user: {
      userId,
      email,
      name,
    },
  });
}
