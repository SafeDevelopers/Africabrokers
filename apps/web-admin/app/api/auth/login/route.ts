import { NextRequest, NextResponse } from "next/server";

// Demo accounts for testing (in production, this should query the database)
// Note: Brokers should login via the marketplace, not the admin app
const DEMO_ACCOUNTS: Record<string, { email: string; password: string; role: string; userId: string; tenantId?: string }> = {
  "admin@afribrok.com": {
    email: "admin@afribrok.com",
    password: "admin123",
    role: "SUPER_ADMIN",
    userId: "demo-super-admin-001",
  },
  "tenant@afribrok.com": {
    email: "tenant@afribrok.com",
    password: "tenant123",
    role: "TENANT_ADMIN",
    userId: "demo-tenant-admin-001",
    tenantId: "et-addis",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Only allow SUPER_ADMIN or TENANT_ADMIN roles
    // Brokers must authenticate via the marketplace - this endpoint is admin-only
    if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Only SUPER_ADMIN or TENANT_ADMIN can log in here. Brokers must sign in at the marketplace." },
        { status: 403 }
      );
    }

    // Check if account exists in demo accounts
    const account = DEMO_ACCOUNTS[email.toLowerCase()];

    if (!account) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    if (account.password !== password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify role matches
    if (account.role !== role) {
      return NextResponse.json(
        { message: "Selected role does not match account type" },
        { status: 403 }
      );
    }

    // In production, generate a real JWT token here
    const token = `demo-token-${Date.now()}-${account.userId}`;

    // Create response with cookies
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: account.userId,
          email: account.email,
          role: account.role,
        },
        token,
        tenantId: account.tenantId,
      },
      { status: 200 }
    );

    // Set cookies
    response.cookies.set("afribrok-role", account.role, {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: false, // Allow client-side access for demo
      sameSite: "lax",
    });

    response.cookies.set("afribrok-user-id", account.userId, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: "lax",
    });

    response.cookies.set("afribrok-token", token, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: "lax",
    });

    if (account.tenantId) {
      // Set both tenant cookies for compatibility
      response.cookies.set("afribrok-tenant", account.tenantId, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: false,
        sameSite: "lax",
      });
      // Set tenant-id cookie (required by middleware for TENANT_ADMIN)
      response.cookies.set("afribrok-tenant-id", account.tenantId, {
        path: "/",
        maxAge: 60 * 60 * 24,
        httpOnly: false,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

