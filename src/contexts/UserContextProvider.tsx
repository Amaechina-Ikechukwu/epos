"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface OwenData {
  id: number;
  name: string;
  approved: boolean;
  logo?: string;
  address?: string;
  [key: string]: any;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  photo: string;
  phone: string;
  gender: string;
  role: string;
  owen?: OwenData;
  worksIn?: OwenData;
  [key: string]: any;
}

interface UserContextType {
  user: UserData | null;
  isApproved: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isApproved: false,
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://receipt-branch-test-hkxeu.ondigitalocean.app/v2/user",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              "notification-token": "jjjjjjjjj",
              Authorization: "Bearer id Q7YmiqbzS3MeDTFncEqzdbb0riL2",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);

        const approvalSource = data?.owen || data?.worksIn;
        setIsApproved(!!approvalSource?.approved);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isApproved, loading }}>
      {children}
    </UserContext.Provider>
  );
};
