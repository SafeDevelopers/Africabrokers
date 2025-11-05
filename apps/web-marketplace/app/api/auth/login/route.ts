import { NextRequest, NextResponse } from "next/server";

const CORE_API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || process.env.CORE_API_BASE_URL || "http://localhost:4000";

// Demo broker accounts for testing (in production, this should query the database)
const DEMO_BROKER_ACCOUNTS: Record<string, { email: string; password: string; userId: string; tenantId: string; brokerStatus?: string }> = {
  "broker@marketplace.com": {
    email: "broker@marketplace.com",
    password: "broker123",
    userId: "demo-broker-001",
    tenantId: "et-addis",
    brokerStatus: "approved", // Demo: approved broker
  },
};

/**
 * Check broker status from backend API
 * Returns broker status if user is a broker, null otherwise
 */
async function checkBrokerStatus(userId: string, tenantId: string): Promise<string | null> {
  try {
    // Call backend API to get user's broker profile
    const response = await fetch(`${CORE_API_BASE_URL}/v1/brokers?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant": tenantId,
        "x-tenant-id": tenantId,
      },
    });

    if (!response.ok) {
      // If broker not found, user is not a broker
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const brokers = await response.json();
    // Backend may return array or single object
    const broker = Array.isArray(brokers) ? brokers[0] : brokers;
    
    if (!broker || !broker.status) {
      return null;
    }

    return broker.status;
  } catch (error) {
    console.error("Error checking broker status:", error);
    // In development, allow fallback to demo accounts
    if (process.env.NODE_ENV !== "production") {
      return null;
    }
    throw error;
  }
}

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

    // Only allow BROKER role for marketplace authentication
    if (role !== "BROKER") {
      return NextResponse.json(
        { message: "Invalid role. Only BROKER can sign in here." },
        { status: 403 }
      );
    }

    // Check if account exists in demo accounts
    const account = DEMO_BROKER_ACCOUNTS[email.toLowerCase()];

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

    // Check broker status from backend
    // In production, authenticate with backend first, then check broker status
    let brokerStatus: string | null = null;
    
    if (process.env.NODE_ENV === "production" || process.env.CHECK_BROKER_STATUS === "true") {
      // Call backend auth endpoint first
      try {
        const authResponse = await fetch(`${CORE_API_BASE_URL}/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant": account.tenantId,
          },
          body: JSON.stringify({ email, role: "BROKER" }),
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          // Check broker status
          brokerStatus = await checkBrokerStatus(authData.user?.id || account.userId, account.tenantId);
        }
      } catch (error) {
        console.error("Backend auth error, using demo account:", error);
        // Fallback to demo account status
        brokerStatus = account.brokerStatus || null;
      }
    } else {
      // Use demo account status
      brokerStatus = account.brokerStatus || null;
    }

    // CRITICAL: Only set ab_broker_session cookie if broker status is APPROVED
    if (brokerStatus !== "approved") {
      return NextResponse.json(
        { 
          message: brokerStatus 
            ? `Broker account is ${brokerStatus}. Only approved brokers can sign in.` 
            : "Broker account not found or not approved. Please complete your broker application first."
        },
        { status: 403 }
      );
    }

    // Generate a session token (in production, use proper JWT)
    const sessionToken = `session-${Date.now()}-${account.userId}`;

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: account.userId,
          email: account.email,
          role: "BROKER",
        },
        tenantId: account.tenantId,
      },
      { status: 200 }
    );

    // Set ONLY ab_broker_session cookie (HTTP-only, secure)
    // This is the only cookie that middleware will honor
    response.cookies.set("ab_broker_session", sessionToken, {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true, // HTTP-only for security
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS only)
    });

    // Also set tenant cookie (non-sensitive)
    response.cookies.set("afribrok-tenant", account.tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false, // Allow client-side access for tenant context
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

