import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Remove the access token and merchant ID (or invalidate them)
  const res = NextResponse.json({
    message: "Successfully disconnected from Square",
  });
  res.cookies.delete("square_access_token");
  res.cookies.delete("merchant_id");
  return res;
}
