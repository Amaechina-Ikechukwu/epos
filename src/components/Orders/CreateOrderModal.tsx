"use client";
import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useAlert } from "@/contexts/AlertContextProvider";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

export default function CreateOrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [lineItems, setLineItems] = useState([
    { name: "", quantity: "1", price: "" },
  ]);

  const handleAddItem = () => {
    setLineItems([...lineItems, { name: "", quantity: "1", price: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };
  const { showAlert } = useAlert();
  const handleSubmit = async () => {
    const payload = {
      idempotency_key: Date.now().toString(),
      order: {
        location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID, // or pass as prop
        line_items: lineItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          base_price_money: {
            amount: parseInt(item.price) * 100, // $4.50 => 450
            currency: "USD",
          },
        })),
      },
    };

    const res = await fetch("/api/square/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      showAlert("Order created! ID: " + data.order?.id, "success");
      onClose();
    } else {
      showAlert("Error creating order", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Create Square Order
        </Typography>

        {lineItems.map((item, index) => (
          <Box
            key={index}
            gap={1}
            mb={1}
            p={5}
            sx={{ backgroundColor: "#404040", borderRadius: 5 }}
          >
            <TextField
              fullWidth
              label="Item Name"
              value={item.name}
              sx={{ marginBottom: 2 }}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
            <Box display={"flex"}>
              <TextField
                label="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", e.target.value)
                }
                sx={{ width: 70, marginRight: 2 }}
              />
              <TextField
                label="Price ($)"
                type="number"
                value={item.price}
                onChange={(e) => handleChange(index, "price", e.target.value)}
                sx={{ width: 100 }}
              />
              <IconButton onClick={() => handleRemoveItem(index)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
        ))}

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
