import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // For validating the signature

// Helper function to verify the webhook signature
function verifySignature(body: string, signature: string): boolean {
  const SQUARE_WEBHOOK_SIGNATURE_KEY =
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";

  const hmac = crypto.createHmac("sha1", SQUARE_WEBHOOK_SIGNATURE_KEY);
  const computedSignature = hmac.update(body).digest("hex");

  return computedSignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    // Get the signature from the request headers
    const signature = req.headers.get("X-Square-Signature") || "";

    // Read the request body
    const body = await req.text();

    // Verify the signature
    if (!verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse the incoming webhook event
    const event = JSON.parse(body);

    // You can now handle the event based on its type
    console.log("Received webhook event:", event);

    // Respond to Square that the webhook was successfully received
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
