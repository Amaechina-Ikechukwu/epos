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
        };
      };
    }[];
  };
};

function CreateOrderModal({
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

  const { showAlert } = useAlert();

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
        console.log(JSON.stringify(data, null, 2));
        showAlert("Order created! ID: " + data.order?.id, "success");
        // Clear the form (reset line items)
        setLineItems([{ itemId: "", quantity: "1" }]);

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

  return (
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
  );
}

function CreateCatalogModal({
  open,
  onClose,
  refreshCatalog,
}: {
  open: boolean;
  onClose: () => void;
  refreshCatalog: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const { showAlert } = useAlert();

  const handleSubmit = async () => {
    showAlert("Catalog is being created", "info");
    const amountInCents = Math.round(parseFloat(price) * 100);

    const res = await fetch("/api/square/create-catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: amountInCents, currency }),
    });

    if (res.ok) {
      showAlert("Catalog item created successfully", "success");
      setName("");
      setPrice("");
      setCurrency("USD");
      onClose();
      refreshCatalog();
    } else {
      const error = await res.json();
      showAlert(error.error || "Failed to create catalog item", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h6" mb={3}>
          Create Catalog Item
        </Typography>
        <TextField
          label="Item Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Currency"
          fullWidth
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          sx={{ mb: 3 }}
        >
          {currencies.map((cur) => (
            <MenuItem key={cur} value={cur}>
              {cur}
            </MenuItem>
          ))}
        </TextField>
        <Box textAlign="right">
          <Button variant="contained" onClick={handleSubmit}>
            Add Item
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default function CatalogManager() {
  const [catalog, setCatalog] = useState<any[] | undefined>(undefined);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openCatalogModal, setOpenCatalogModal] = useState(false);

  const fetchCatalog = async () => {
    const res = await fetch("/api/square/retrieve-catalogue");
    if (res.ok) {
      const data = await res.json();
      console.log({ data });
      setCatalog(data.items || []);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);
  if (!catalog) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
      <CreateOrderModal
        catalog={catalog}
        open={openOrderModal}
        onClose={() => setOpenOrderModal(false)}
      />
      <CreateCatalogModal
        open={openCatalogModal}
        onClose={() => setOpenCatalogModal(false)}
        refreshCatalog={fetchCatalog}
      />

      <Paper elevation={3} sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Button variant="contained" onClick={() => setOpenCatalogModal(true)}>
            + Add Item
          </Button>
          <Button variant="outlined" onClick={() => setOpenOrderModal(true)}>
            + Create Order
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          Catalog Items
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {catalog.length === 0 ? (
          <Typography>No catalog items found.</Typography>
        ) : (
          catalog.map((item, i) => (
            <Box
              key={i}
              sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}
            >
              <Typography fontWeight="bold">{item.itemData?.name}</Typography>
              <Typography>
                Price:{" "}
                {item.itemData?.variations?.[0]?.itemVariationData?.priceMoney
                  ?.amount / 100}{" "}
                {
                  item.itemData?.variations?.[0]?.itemVariationData?.priceMoney
                    ?.currency
                }
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </>
  );
}
