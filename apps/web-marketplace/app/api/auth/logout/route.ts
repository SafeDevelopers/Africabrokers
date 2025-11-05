import { NextRequest, NextResponse } from "next/server";

/**
 * Logout endpoint for marketplace
 * Clears the ab_broker_session cookie
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear ab_broker_session cookie
  response.cookies.set("ab_broker_session", "", {
    path: "/",
    maxAge: 0, // Expire immediately
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Also clear legacy cookies if they exist (cleanup)
  const legacyCookies = [
    "afribrok-role",
    "afribrok-token",
    "afribrok-user-id",
  ];

  legacyCookies.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
    });
  });

  return response;
}

// Also support GET for logout (common pattern)
export async function GET(request: NextRequest) {
  return POST(request);
}

