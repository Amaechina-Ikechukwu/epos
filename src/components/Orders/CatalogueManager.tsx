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
import { CreateCatalogModal } from "./CreateCatalogueModal";
import { CreateOrderModal } from "./CreateOrderModal";
import { auth } from "@/firebase/config";

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

export default function CatalogManager() {
  const [catalog, setCatalog] = useState<any[] | undefined>(undefined);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openCatalogModal, setOpenCatalogModal] = useState(false);

  const fetchCatalog = async () => {
    const res = await fetch("/api/square/retrieve-catalogue");
    if (res.ok) {
      const data = await res.json();

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
          Catalog Items {auth?.currentUser?.uid}
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
