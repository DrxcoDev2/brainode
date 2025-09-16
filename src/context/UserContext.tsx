"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  email: string;
  name: string;
  setUser: (email: string, name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    if (storedEmail) setEmail(storedEmail);
    if (storedName) setName(storedName);
  }, []);

  const setUser = (email: string, name: string) => {
    setEmail(email);
    setName(name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
  };

  const logout = () => {
    setEmail("");
    setName("");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  };

  return (
    <UserContext.Provider value={{ email, name, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
}
