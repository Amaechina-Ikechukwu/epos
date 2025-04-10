// app/api/square/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto"; // adjust path if needed

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: process.env.SQUARE_APPLICATION_ID || "",
    client_secret: process.env.SQUARE_ACCESS_TOKEN || "", // Use this as secret if you’re not using `client_secret`
    code,
    grant_type: "authorization_code",
    redirect_uri: process.env.SQUARE_REDIRECT_URI || "", // Ensure this matches the redirect URI used during authorization
  });

  try {
    const response = await fetch("https://connect.squareup.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OAuth token exchange failed:", result);
      return NextResponse.json(
        { error: "Failed to exchange code" },
        { status: 500 }
      );
    }

    // Store tokens in DB or secure storage (mocked here with cookies for now)
    const merchant_id = result.merchant_id;
    const access_token = result.access_token;
    const encryptedToken = encrypt(access_token);
    const res = NextResponse.redirect(new URL("/settings", req.url));
    res.cookies.set("square_access_token", encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.cookies.set("merchant_id", merchant_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
