import { NextRequest, NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const encryptedToken = req.cookies.get("square_access_token")?.value;
    if (!encryptedToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = decrypt(encryptedToken);

    const client = new SquareClient({
      token: accessToken,
      environment: SquareEnvironment.Production,
    });

    const body = await req.json();

    const response = await client.catalog.object.upsert({
      idempotencyKey: crypto.randomUUID(), // ensures uniqueness
      object: {
        type: "ITEM",
        id: `#${body.name}`, // temporary client ID
        itemData: {
          name: body.name,
          description: body.description,
          abbreviation: body.abbreviation || "",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: "#NewItemVariation",
              itemVariationData: {
                name: "Regular",
                pricingType: "FIXED_PRICING",
                priceMoney: {
                  amount: BigInt(body.price), // ✅ convert to bigint
                  currency: "USD",
                },
              },
            },
          ],
        },
      },
    });
  
    return NextResponse.json({
      success: true,
      result: response.catalogObject?.id,
    });
  } catch (error) {
    console.error("Create catalog error:", error);
    return NextResponse.json(
      { error: "Failed to create catalog item" },
      { status: 500 }
    );
  }
}
