import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy broker signin route - redirect to marketplace
 * 301 redirect to marketplace signin page
 */
export async function GET(request: NextRequest) {
  const marketplaceUrl = process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${marketplaceUrl}/signin`, 301);
}

export async function POST(request: NextRequest) {
  const marketplaceUrl = process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${marketplaceUrl}/signin`, 301);
}

