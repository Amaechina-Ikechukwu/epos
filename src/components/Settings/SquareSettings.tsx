"use client";
import { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const SquareSettings = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>();
  const [merchantName, setMerchantName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/square/check-connection");
        if (response.ok) {
          const data = await response.json();
          setIsConnected(true);
          setMerchantName(data.merchant_name);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Failed to check Square connection:", err);
      }
    };

    checkConnection();
  }, []);

  const handleConnectToSquare = async () => {
    // Just redirect the user to the login endpoint
    window.location.href = "/api/square/login";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h3">Reciept Branch + Square</Typography>
      {isConnected ? (
        <Typography variant="subtitle1">
          Connected to Square! Merchant: {merchantName}
        </Typography>
      ) : (
        <Typography variant="subtitle1">
          To get started, connect your Square account and start managing your
          payments and orders..
        </Typography>
      )}
      {isConnected == null ? (
        <CircularProgress size={20} />
      ) : (
        <Button
          variant="contained"
          color="primary"
          disabled={isConnected}
          onClick={handleConnectToSquare}
          sx={{ width: "30%" }}
        >
          Connect to Square
        </Button>
      )}
    </Box>
  );
};

export default SquareSettings;
