"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Logo from "../constants/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Import the router

interface Props {
  window?: () => Window;
  children?: React.ReactNode;
}

const drawerWidth = 240;

const navItems = [
  { label: "Home", path: "/" },
  { label: "Settings", path: "/settings" },
  { label: "Contact", path: "/contact" },
];

export default function DrawerAppBar(props: Props) {
  const { window, children } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathName = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter(); // Get the current route from the router

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawerContent = (
    <div>
      {!isMobile ? (
        <Box sx={{ p: 2 }}>
          <Logo style={{ width: 100, marginBottom: "20px" }} />
        </Box>
      ) : (
        <Box sx={{ height: 50 }} />
      )}

      <List sx={{ outline: "none", border: "none", gap: "50px" }}>
        {navItems.map((item) => {
          const isActive = pathName === item.path;
          return (
            <ListItem key={item.label}>
              <ListItemButton
                component={Link}
                href={item.path}
                sx={{
                  // Apply active styles dynamically
                  color: isActive
                    ? "background.paper"
                    : theme.palette.text.secondary,
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : "transparent",
                  boxShadow: isActive
                    ? `0 0 20px ${theme.palette.primary.main}`
                    : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                    color: "info.main",
                  },
                  transition: "all 0.3s ease",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    fontSize: "20px",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Custom top bar for mobile */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            backgroundColor: "#fff",
            borderBottom: "1px solid #eee",
            zIndex: 1300,
          }}
        >
          <Logo style={{ width: 100, marginBottom: 0 }} />
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Sidebar navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          container={container}
          variant="temporary" // Changed to temporary for mobile
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              transition: theme.transitions.create("transform", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent} {/* Use the consistently rendered content */}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              boxShadow: "0px 0px 20px rgba(0,0,0,0.08)",
              border: "none",
              borderRight: "none",
              outline: "none",
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(10px)",
            },
          }}
          open
        >
          {drawerContent} {/* Use the consistently rendered content */}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: "64px", md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
