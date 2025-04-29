import Image from "next/image";
import React from "react";
import { Box } from "@mui/material";

interface LogoProps {
  style?: React.CSSProperties;
}

export default function Logo({ style }: LogoProps) {
  return (
    <Box
      sx={{
        width: { xs: 120, sm: 150, md: 180 }, // Responsive width
        height: "auto",
        ...style, // Optional custom styles
      }}
    >
      <Image
        src="/logo_primary.png"
        alt="Receipt Branch logo"
        layout="responsive"
        width={180}
        height={38}
        priority
      />
    </Box>
  );
}
