import { NextRequest, NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square";
import { decrypt } from "@/lib/crypto";

function replacer(key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function GET(req: NextRequest) {
  try {
    const encryptedToken = req.cookies.get("square_access_token")?.value;
    if (!encryptedToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = decrypt(encryptedToken);

    const client = new SquareClient({
      token: accessToken,
      environment: SquareEnvironment.Production,
    });

    const response = await client.catalog.list({
      types: "ITEM",
    });

    // Convert BigInts to strings
    const serializedData = JSON.parse(JSON.stringify(response.data, replacer));

    return NextResponse.json({ items: serializedData });
  } catch (error) {
    console.error("Retrieve catalog error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve catalog" },
      { status: 500 }
    );
  }
}
