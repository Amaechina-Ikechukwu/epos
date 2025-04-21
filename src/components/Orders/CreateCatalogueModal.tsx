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
export function CreateCatalogModal({
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
