"use client";
import React, { createContext, useContext, useState, ReactNode } from "react"; // Import necessary React hooks and types
import Snackbar from "@mui/material/Snackbar"; // Import Snackbar component from MUI for displaying notifications
import MuiAlert, { AlertColor } from "@mui/material/Alert"; // Import Alert component from MUI to show alert messages

// Type definition for AlertContext, which will manage the display of alerts in the app
type AlertContextType = {
  showAlert: (message: string, severity?: AlertColor) => void; // Function to trigger an alert with message and optional severity
};

// Create a context to store alert functions and state; initial value is undefined
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Custom hook to access the AlertContext from anywhere in the component tree
export const useAlert = () => {
  const context = useContext(AlertContext); // Access the current context value

  // If the context is undefined (not wrapped by AlertProvider), throw an error
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  // Return the context value, which includes the showAlert function
  return context;
};

// AlertProvider component that will wrap the app's components and provide alert functionality
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  // State to manage whether the alert is open or not
  const [open, setOpen] = useState(false);

  // State to manage the message displayed in the alert
  const [message, setMessage] = useState("");

  // State to manage the severity of the alert (info, success, error, warning)
  const [severity, setSeverity] = useState<AlertColor>("info");

  // Function to show the alert with a message and optional severity
  const showAlert = (msg: string, sev: AlertColor = "info") => {
    setMessage(msg); // Set the message to be displayed in the alert
    setSeverity(sev); // Set the severity (type) of the alert
    setOpen(true); // Open the alert by setting state to true
  };

  // Function to close the alert when triggered, avoiding closure if the reason is "clickaway"
  const handleClose = (_: unknown, reason?: string) => {
    if (reason === "clickaway") return; // Don't close alert if it's dismissed by clicking away
    setOpen(false); // Close the alert
  };

  return (
    // Providing the showAlert function to the component tree through context
    <AlertContext.Provider value={{ showAlert }}>
      {children} {/* Rendering the child components */}
      {/* Snackbar component displays the alert message */}
      <Snackbar
        open={open} // Whether the snackbar is visible
        autoHideDuration={4000} // Duration the snackbar will remain visible (4 seconds)
        onClose={handleClose} // Function to close the snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // Position of the snackbar on the screen
      >
        {/* MuiAlert component renders the actual alert */}
        <MuiAlert
          onClose={handleClose} // Function to close the alert when clicked
          severity={severity} // Severity level of the alert (info, success, error, warning)
          elevation={6} // Shadow effect for the alert
          variant="filled" // Variant style of the alert (filled for solid background)
          sx={{ color: "backgroud.paper" }}
        >
          {message} {/* The message displayed in the alert */}
        </MuiAlert>
      </Snackbar>
    </AlertContext.Provider>
  );
};
