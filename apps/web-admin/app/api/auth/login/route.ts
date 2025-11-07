import { NextRequest, NextResponse } from "next/server";

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || 'http://localhost:4000';

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

    // Call the backend API for authentication
    try {
      const response = await fetch(`${CORE_API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        return NextResponse.json(
          { message: errorData.message || "Invalid email or password" },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Extract tenant ID from response
      const tenantId = data.tenant?.id || data.tenantId || null;
      
      // Create response with cookies
      const nextResponse = NextResponse.json(
        {
          message: "Login successful",
          user: data.user,
          token: data.token,
          tenantId: tenantId,
        },
        { status: 200 }
      );

      // Set cookies from API response
      if (data.user?.role) {
        nextResponse.cookies.set("afribrok-role", data.user.role, {
          path: "/",
          maxAge: 60 * 60 * 24, // 24 hours
          httpOnly: false,
          sameSite: "lax",
        });
      }

      if (data.user?.id) {
        nextResponse.cookies.set("afribrok-user-id", data.user.id, {
          path: "/",
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          sameSite: "lax",
        });
      }

      if (data.token) {
        nextResponse.cookies.set("afribrok-token", data.token, {
          path: "/",
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          sameSite: "lax",
        });
      }

      // Set tenant cookies - always set tenant-id for middleware compatibility
      // For TENANT_ADMIN and AGENT roles, tenantId is required
      if (tenantId && (data.user?.role === 'TENANT_ADMIN' || data.user?.role === 'AGENT')) {
        nextResponse.cookies.set("afribrok-tenant", tenantId, {
          path: "/",
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          sameSite: "lax",
        });
        nextResponse.cookies.set("afribrok-tenant-id", tenantId, {
          path: "/",
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          sameSite: "lax",
        });
      }

      return nextResponse;
    } catch (apiError) {
      console.error("Backend API error:", apiError);
      return NextResponse.json(
        { message: "Unable to connect to authentication service. Please try again later." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

