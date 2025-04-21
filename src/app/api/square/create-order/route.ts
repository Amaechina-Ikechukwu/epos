import { NextRequest, NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square";
import { decrypt } from "@/lib/crypto"; // your decrypt method

export async function POST(req: NextRequest) {
  try {
    const encryptedToken = req.cookies.get("square_access_token")?.value;

    if (!encryptedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = decrypt(encryptedToken);

    // Initialize the Square client
    const client = new SquareClient({
      token: accessToken,
      environment: SquareEnvironment.Production, // or SquareEnvironment.Sandbox for testing
    });

    // Fetch the locations associated with the account
    const locationsResponse = await client.locations.list();

    if (locationsResponse?.locations?.length === 0) {
      return NextResponse.json(
        { error: "No locations found" },
        { status: 400 }
      );
    }

    // Assuming you want the first location's ID
    const location_id = locationsResponse?.locations[0].id || "";

    // Extracting line items from the request body
    const { line_items } = await req.json();

    if (!line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: "No line items provided" },
        { status: 400 }
      );
    }

    // Ensure that each line item has a BigInt for the amount
    const formattedLineItems = line_items.map((item) => {
      const basePriceAmount = item.basePriceMoney?.amount;

      // Ensure amount is converted to BigInt
      if (basePriceAmount) {
        item.basePriceMoney.amount = BigInt(basePriceAmount);
      } else {
        // Handle cases where price might be missing
        console.error(`Missing or invalid price for item ${item.name}`);
        item.basePriceMoney.amount = BigInt(100); // Default to 1 USD (100 cents)
      }

      return item;
    });

    // Create the order with properly formatted line items
    const { order } = await client.orders.create({
      order: {
        locationId: location_id,
        lineItems: formattedLineItems,
      },
    });

    // Convert BigInt values to string for response (for JSON serialization)
    const orderJson = JSON.parse(
      JSON.stringify(order, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json({ success: true, order: orderJson });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
