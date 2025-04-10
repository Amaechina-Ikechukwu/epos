// app/api/square/check-connection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
export async function GET(req: NextRequest) {
  const encryptedToken = req.cookies.get("square_access_token")?.value;
  if (!encryptedToken) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const accessToken = decrypt(encryptedToken);
  if (!accessToken) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  try {
    const response = await fetch(
      "https://connect.squareup.com/v2/merchants/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json({
      connected: true,
      merchant_name: data.merchant?.business_name || "Square Merchant",
    });
  } catch (error) {
    console.error("Check connection error:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
