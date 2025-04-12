import { NextRequest, NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square";
import { decrypt } from "@/lib/crypto"; // Your decryption function

export async function GET(req: NextRequest) {
  try {
    // Get the encrypted access token from cookies
    const encryptedToken = req.cookies.get("square_access_token")?.value;

    if (!encryptedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decrypt the token to get the access token
    const accessToken = decrypt(encryptedToken);

    // Initialize the Square client
    const client = new SquareClient({
      token: accessToken,
      environment: SquareEnvironment.Production, // Use SquareEnvironment.Sandbox for testing
    });

    // Fetch locations associated with the account
    const locationsResponse = await client.locations.list();

    if (locationsResponse.locations?.length === 0) {
      return NextResponse.json(
        { error: "No locations found" },
        { status: 400 }
      );
    }

    // Assuming you want the first location's ID
    const location_id = locationsResponse.locations[0].id;

    // Retrieve orders for the location
    const ordersResponse = await client.orders.get();

    // Check if orders were returned
    if (!ordersResponse.orders || ordersResponse.orders.length === 0) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    // Respond with the list of orders
    return NextResponse.json({ orders: ordersResponse.orders });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    return NextResponse.json(
      { error: "Error retrieving orders" },
      { status: 500 }
    );
  }
}
