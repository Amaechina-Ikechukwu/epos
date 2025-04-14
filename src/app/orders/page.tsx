"use client";
import { useState } from "react";

import { Button } from "@mui/material";
import CatalogManager from "@/components/Orders/CatalogueManager";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CatalogManager />
    </>
  );
}
