// app/api/webhook/route.ts
import crypto from "crypto";
import { WebhooksHelper } from "square";
import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_URL =
  "https://02d4-102-90-98-190.ngrok-free.app/api/webhook";
const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";

export async function POST(req: NextRequest) {
  const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
  const body = '{"your":"webhook-payload"}'; // Replace this with the actual body string
  const changedsignature = crypto
    .createHmac("sha256", SIGNATURE_KEY)
    .update(body)
    .digest("base64");

  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") || "";

  const isValid = await WebhooksHelper.verifySignature({
    requestBody: rawBody,
    signatureHeader: signature,
    signatureKey: SIGNATURE_KEY,
    notificationUrl: NOTIFICATION_URL,
  });

  if (!isValid) {
    console.warn("❌ Invalid Square webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const event = JSON.parse(rawBody);

  return NextResponse.json({ success: true });
}
