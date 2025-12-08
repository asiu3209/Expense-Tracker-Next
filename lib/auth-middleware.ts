import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Authentication middleware function
export async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string; email: string; name: string } | NextResponse> {
  try {
    // Step 1: Extract token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract token (format: "Bearer TOKEN_HERE")
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Step 2: Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Step 3: Verify our app's JWT token (not Auth0's token)
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      name: string;
      iat: number;
      exp: number;
    };

    // Step 4: Return user information from verified token
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error: any) {
    // Handle different types of JWT errors
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Token has expired. Please sign in again." },
        { status: 401 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid token. Please sign in again." },
        { status: 401 }
      );
    }

    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

// Helper function for cleaner route handlers
export async function withAuth(
  request: NextRequest,
  handler: (
    userId: string,
    email: string,
    name: string
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  // Call the handler with authenticated user data
  return handler(authResult.userId, authResult.email, authResult.name);
}

// Type for authenticated requests (useful for protected routes)
export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    email: string;
    name: string;
  };
}
