import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to see what Keycloak is sending in the callback
 * Access: http://localhost:3000/api/auth/callback-debug?error=keycloak&error_description=...
 * 
 * This helps diagnose OAuth callback issues
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: {
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
    },
  };

  console.log("[DEBUG] Callback URL received:", JSON.stringify(debugInfo, null, 2));

  return NextResponse.json({
    message: "Callback debug info logged to server console",
    debugInfo,
  }, { status: 200 });
}

