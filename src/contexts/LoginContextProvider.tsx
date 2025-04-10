"use client";
// LoginContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import { LoginContextType, User } from "../types";
import LoginComponents from "../components/Authentication/LoginComponents";
import { auth } from "@/firebase/config";

// Helper to convert Firebase user to your app's User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? "",
  displayName: firebaseUser.displayName ?? "",
  photoURL: firebaseUser.photoURL ?? "",
});

// Create context
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// Provider
export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser = mapFirebaseUserToUser(firebaseUser);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Stub login (or you can implement one with email/password)
  const login = (userData: User) => setUser(userData);

  // Firebase logout
  const logout = async () => {
    await signOut(auth);
  };

  const contextValue: LoginContextType = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };

  if (loading) return null; // Or show spinner

  return (
    <LoginContext.Provider value={contextValue}>
      {children}
      <LoginComponents user={user} />
    </LoginContext.Provider>
  );
};

// Custom hook
export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};
