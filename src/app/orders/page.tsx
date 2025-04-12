"use client";
import { useState } from "react";

import { Button } from "@mui/material";
import CreateOrderModal from "@/components/Orders/CreateOrderModal";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create Order
      </Button>
      <CreateOrderModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
