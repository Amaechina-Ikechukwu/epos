"use client";
import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Modal,
  IconButton,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useAlert } from "@/contexts/AlertContextProvider";
import { auth } from "@/firebase/config";
import { useUser } from "@/contexts/UserContextProvider";
import { QRCodeModal } from "./QRCode";

const currencies = ["USD", "EUR", "NGN", "GBP", "CAD"];

type CatalogItem = {
  id: string;
  itemData: {
    name: string;
    variations?: {
      id: string;
      itemVariationData: {
        priceMoney?: {
          amount: number;
          currency: string;
        };
      };
    }[];
  };
};

export function CreateOrderModal({
  open,
  onClose,
  catalog,
}: {
  open: boolean;
  onClose: () => void;
  catalog: CatalogItem[];
}) {
  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    maxHeight: "80vh", // limit the modal height to 80% of the viewport
    overflowY: "auto", // allow scrolling when content exceeds height
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const [lineItems, setLineItems] = useState([{ itemId: "", quantity: "1" }]);
  const { user } = useUser();
  const { showAlert } = useAlert();
  const [url, setUrl] = useState("");
  const handleAddItem = () =>
    setLineItems([...lineItems, { itemId: "", quantity: "1" }]);

  const handleRemoveItem = (index: number) =>
    setLineItems(lineItems.filter((_, i) => i !== index));

  const handleChange = (
    index: number,
    field: "itemId" | "quantity",
    value: string
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLineItems(updated);
  };

  const handleSubmit = async () => {
    // Prepare payload with order details
    const payload = {
      idempotency_key: Date.now().toString(), // Ensures that the request is not duplicated

      line_items: lineItems.map((item) => {
        const catalogItem = catalog.find((c) => c.id === item.itemId);

        // Ensure the catalog item and its variations exist
        const variationId = catalogItem?.itemData?.variations?.[0]?.id;

        // Get the price of the item (if available)
        //@ts-ignore
        let price = catalogItem?.itemData?.variations?.[0]?.price_money?.amount;

        // If the price is missing or invalid, log the error and set a default price
        if (!price || price <= 0) {
          // console.error(`Invalid or missing price for item ${item.itemId}`);
          // Here, you might want to either reject the order or handle it differently
          price = 100; // Default to 1 USD (100 cents)
        }

        return {
          name: catalogItem?.itemData?.name || "Unknown Item", // Item name
          quantity: item.quantity, // Quantity (e.g., 0.5 for half)
          quantityUnit: {
            measurementUnit: {
              volumeUnit: "GENERIC_GALLON", // Adjust based on your catalog
            },
            precision: 2, // Precision can be adjusted as needed
          },
          basePriceMoney: {
            amount: price,
            currency: "USD", // Ensure the currency is set correctly
          },
        };
      }),
    };

    // Send the request to create an order
    try {
      // console.log(payload);
      const res = await fetch("/api/square/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if the response is successful
      if (res.ok) {
        const data = await res.json();
        showAlert("Creating QR Code: " + data.order?.id, "info");
        sendToShopifySquareAPI(data);
        showAlert("QR code created: " + data.order?.id, "success");

        onClose();
      } else {
        // Handle unsuccessful response and log error
        const errorData = await res.json();
        console.error("Error creating order:", errorData);
        showAlert(
          `Error creating order: ${errorData.error || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error with order submission:", error);
      showAlert("Unexpected error occurred", "error");
    }
  };

  const sendToShopifySquareAPI = async (squareOrderResponse: any) => {
    const squareOrder = squareOrderResponse.order;

    const payload = {
      success: true,
      order: squareOrder,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shopify/square/orders/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer id ${auth?.currentUser?.uid}`, // 🔐 Replace with real token
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log("Synced to Shopify+Square:", data);
        await shareReceipt(data.id);
        showAlert("Synced with Shopify/Square successfully!", "success");
        showAlert("Getting info", "info");
      } else {
        const error = await res.json();
        console.error("Sync Error:", error);
        showAlert(
          "Sync failed: " + (error.message || "Unknown error"),
          "error"
        );
      }
    } catch (err) {
      console.error("Network error syncing to Shopify+Square:", err);
      showAlert("Network error syncing order", "error");
    }
  };

  const shareReceipt = async (eposOrderId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/receipt/share`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer id ${auth?.currentUser?.uid}`, // Replace with actual user ID or token
          },
          body: JSON.stringify({
            threadId: "",
            price: 0,
            eposOrderId,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert("Faied to create reciept", "error");
        throw new Error(errorData.message || "Failed to share receipt");
      }

      const data = await res.json();
      await acceptReceipt(data.uuid);
      return data;
    } catch (err) {
      console.error("Network or server error:", err);
      throw err;
    }
  };

  const acceptReceipt = async (uuid: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/receipt/accept`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer id ${auth?.currentUser?.uid}`, // Use actual user ID or token
          },
          body: JSON.stringify({ uuid }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(`"Error accepting receipt:", ${errorData}`, "error");
      }

      const data = await res.json();
      setUrl(data.url);
      showAlert("QR Code generated, display for scanning", "success");
      return data;
    } catch (err) {
      console.error("Network or server error:", err);
      throw err;
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Create Square Order
          </Typography>

          {lineItems.map((item, index) => {
            const selectedItem = catalog.find((c) => c.id === item.itemId);
            const variation = selectedItem?.itemData?.variations?.[0];
            const unitPrice =
              variation?.itemVariationData?.priceMoney?.amount ?? 0;
            const currency =
              variation?.itemVariationData?.priceMoney?.currency ?? "USD";
            const quantity = parseInt(item.quantity) || 0;
            const totalPrice = ((unitPrice * quantity) / 100).toFixed(2);

            return (
              <Box
                key={index}
                mb={2}
                p={2}
                sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}
              >
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id={`item-select-label-${index}`}>
                    Select Item
                  </InputLabel>
                  <Select
                    labelId={`item-select-label-${index}`}
                    value={item.itemId}
                    label="Select Item"
                    onChange={(e: SelectChangeEvent<string>) =>
                      handleChange(index, "itemId", e.target.value)
                    }
                  >
                    {catalog.map((catItem) => {
                      const variation = catItem.itemData?.variations?.[0];
                      const price =
                        variation?.itemVariationData?.priceMoney?.amount ?? 0;
                      const currency =
                        variation?.itemVariationData?.priceMoney?.currency ??
                        "USD";

                      return (
                        <MenuItem
                          key={catItem.id}
                          value={catItem.id}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: 70,
                            borderBottom: "1px solid",
                            borderColor: "gray",
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {catItem.itemData.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(price / 100).toFixed(2)} {currency}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <Box display="flex" alignItems="center">
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                    sx={{ width: 70, mr: 2 }}
                  />
                  <TextField
                    label="Total ($)"
                    type="number"
                    value={totalPrice}
                    disabled
                    sx={{ width: 120 }}
                  />
                  <IconButton onClick={() => handleRemoveItem(index)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mb: 2 }}>
            Add Item
          </Button>
          <Box textAlign="right">
            <Button variant="contained" onClick={handleSubmit}>
              Submit Order
            </Button>
          </Box>
        </Box>
      </Modal>
      <QRCodeModal open={url.length > 1} url={url} onClose={() => setUrl("")} />
    </>
  );
}
