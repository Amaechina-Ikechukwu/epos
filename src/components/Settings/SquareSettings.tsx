"use client";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useAlert } from "@/contexts/AlertContextProvider";
import { useSquare } from "@/contexts/SquareContextProvider";

const SquareSettings = () => {
  const [open, setOpen] = useState(false);
  const { showAlert } = useAlert();
  const { isConnected, merchantName, checkConnection } = useSquare();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConnectToSquare = async () => {
    showAlert("Redirecting to Square", "success");
    window.location.href = "/api/square/login";
  };

  const disconnectSquare = async () => {
    showAlert("Disconnecting from Square", "info");
    try {
      const response = await fetch("/api/square/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        showAlert("Successfully disconnected from Square", "success");
        handleClose();
        checkConnection();
      }
    } catch (error) {
      console.error("Error disconnecting from Square:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h3">Receipt Branch + Square</Typography>

      {isConnected !== null && isConnected ? (
        <Typography variant="subtitle1">
          All Good. Receipt Branch is here for you.
        </Typography>
      ) : (
        <Typography variant="subtitle1">
          To get started, connect your Square account and start managing your
          payments and orders..
        </Typography>
      )}

      {isConnected == null ? (
        <CircularProgress size={20} />
      ) : !isConnected ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectToSquare}
          sx={{ width: "20%" }}
        >
          Connect to Square
        </Button>
      ) : (
        <Button
          variant="outlined"
          onClick={handleClickOpen}
          color="error"
          size="small"
          sx={{ width: "40%" }}
        >
          Disconnect your account ({merchantName})
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Disconnect Square?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you proceed, please understand that you will lose most
            functionalities on this app.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={disconnectSquare} autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SquareSettings;
