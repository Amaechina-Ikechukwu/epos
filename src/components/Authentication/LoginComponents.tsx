"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { User } from "../../types";
import { useLogin } from "../../contexts/LoginContextProvider";
import { useAlert } from "../../contexts/AlertContextProvider";
import { signInWithEmail, signInWithGoogle } from "@/firebase/firebaseAuth";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  border: "none",
  outline: "none",
};

export default function LoginComponents({ user }: { user: User | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useLogin();
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const firebaseUser = await signInWithEmail(email, password);
      if (firebaseUser) {
        const loggedInUser: User = {
          uid: firebaseUser.user.uid,
          displayName:
            firebaseUser.user.displayName || firebaseUser.user.email || "User",
          email: firebaseUser.user.email || "",
          photoURL: firebaseUser.user.photoURL || "",
        };
        login(loggedInUser);
        showAlert("Logged in successfully", "success");
      } else {
        showAlert("There seems to be an issue", "warning");
      }
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      showAlert(error.message, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const firebaseUser = result?.user;
      if (firebaseUser) {
        const loggedInUser: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email || "User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        };

        login(loggedInUser);
        showAlert("Logged in with Google", "success");
      } else {
        showAlert("There seems to be an issue", "warning");
      }
    } catch (error: any) {
      console.error("Google Sign-in error:", error.message);
      showAlert("Couldn't log in successfully", "error");
    }
  };

  return (
    <Modal
      open={user == null}
      onClose={() => {}}
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
    >
      <Box sx={style}>
        <img
          src="https://receiptbranch.com/assets/images/logos/logo_primary.png"
          alt="Logo"
          style={{ width: 100, marginBottom: "20px" }}
        />

        <Typography id="login-modal-title" variant="h6" component="h2" mb={2}>
          Login
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            required
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            required
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleGoogleLogin}
              color="secondary"
              sx={{
                padding: "8px",
                minWidth: "unset",
                borderRadius: "12px",
              }}
            >
              <img
                src="https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-google-icon-PNG.png"
                alt="Google"
                style={{ width: 24, height: 24 }}
              />
            </Button>

            <Button variant="contained" type="submit" color="primary">
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
