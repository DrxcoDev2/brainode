// context/UserContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  email: string;
  setEmail: (e: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const logout = () => {
    setEmail("");
    localStorage.removeItem("userEmail");
  };

  return (
    <UserContext.Provider value={{ email, setEmail, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
}
