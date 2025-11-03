import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Create response
  const response = NextResponse.json(
    {
      message: "Logout successful",
    },
    { status: 200 }
  );

  // Clear all authentication cookies
  const cookiesToClear = [
    'afribrok-role',
    'afribrok-user-id',
    'afribrok-token',
    'afribrok-tenant',
    'afribrok-tenant-id',
  ];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, '', {
      path: '/',
      maxAge: 0, // Expire immediately
      httpOnly: false,
      sameSite: 'lax',
    });
  });

  return response;
}

