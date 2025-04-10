
// firebaseAuth.js
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider } from "./config";

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result; // Return the signed-in user
  } catch (error: any) {
    switch (error.code) {
      case "auth/cancelled-popup-request":
        console.error("Google sign-in popup was cancelled.");
        break;
      case "auth/popup-blocked":
        console.error("Popup was blocked by the browser.");
        break;
      case "auth/popup-closed-by-user":
        console.error("Popup was closed before sign-in.");
        break;
      default:
        console.error("Authentication error:", error);
    }
  }
};

// Email/Password Sign-In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result; // Return the signed-in user
  } catch (error: any) {
    switch (error.code) {
      case "auth/user-not-found":
        console.error("No user found with this email.");
        break;
      case "auth/wrong-password":
        console.error("Incorrect password.");
        break;
      case "auth/invalid-email":
        console.error("Invalid email address.");
        break;
      default:
        console.error("Authentication error:", error);
    }
  }
};
