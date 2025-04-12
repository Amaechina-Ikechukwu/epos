"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button } from "@mui/material";
import { useAlert } from "./AlertContextProvider";
import { useUser } from "./UserContextProvider";
interface SquareContextType {
  isConnected: boolean | null;
  merchantName: string;
  checkConnection: () => void;
}

const SquareContext = createContext<SquareContextType | undefined>(undefined);

export const useSquare = () => {
  const context = useContext(SquareContext);
  if (!context) {
    throw new Error("useSquare must be used within a SquareProvider");
  }
  return context;
};

export const SquareProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [open, setOpen] = useState(false);
  const { showAlert } = useAlert();
  const { isApproved } = useUser();
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      setIsConnected(false);
    }
  };
  const handleConnectToSquare = async () => {
    showAlert("Redirecting to Square", "success");
    window.location.href = "/api/square/login";
  };
  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <SquareContext.Provider
      value={{ isConnected, merchantName, checkConnection }}
    >
      {children}
      <>
        <Dialog
          open={!isConnected && isApproved}
          // onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Connect your Square to Reciept Branch"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              In order to enjoy the use of Reciept Branch, please connect your
              Square by clicking Continue.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {/* <Button onClick={handleClose}>Cancel</Button> */}
            <Button onClick={handleConnectToSquare} autoFocus>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </SquareContext.Provider>
  );
};
