import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const client_id = process.env.SQUARE_APPLICATION_ID;
    if (!client_id) {
      throw new Error(
        "SQUARE_APPLICATION_ID is not set in the environment variables."
      );
    }

    const scopes = [
      "MERCHANT_PROFILE_READ",
      "PAYMENTS_READ",
      "ORDERS_READ",
      "CUSTOMERS_READ",
      "ORDERS_WRITE",
      "ITEMS_READ",
      "ITEMS_WRITE",
    ].join("+");

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const redirectUri = encodeURIComponent(`${origin}/api/square/callback`);

    const authUrl = `https://connect.squareup.com/oauth2/authorize?client_id=${client_id}&scope=${scopes}&session=false&redirect_uri=${redirectUri}`;

    // Optionally, log for debugging purposes
    console.debug("Redirecting to:", authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error during Square OAuth redirect:", error);
    return NextResponse.error();
  }
}
