"use client";
// theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // you can change this to "dark"
    primary: {
      main: "#068e22", // custom green
    },
    secondary: {
      main: "#93d647", // light green
    },
    success: {
      main: "#38BD6E",
    },
    info: {
      main: "#404040",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
