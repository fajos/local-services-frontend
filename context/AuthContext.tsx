// context/AuthContext.tsx
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  provider_id: string;
  is_provider: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  is_verified_provider: boolean;
  is_email_confirmed: boolean;
  is_phone_confirmed: boolean;
  is_identity_verified: boolean;
  identity_status?: string;
  id_type?: string;
  id_number?: string;
  id_photo_url?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

type ViewMode = "customer" | "provider";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (v: "customer" | "provider") => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType>(undefined as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"customer" | "provider">("customer");

  /* expose setter that also writes to storage */
  const changeMode = (v: "customer" | "provider") => {
    setViewMode(v);
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", v);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("viewMode") as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

   /* ---------- helpers ---------- */
   const persistMode = (mode: ViewMode) =>
    typeof window !== "undefined" && localStorage.setItem("viewMode", mode);

   const toggleViewMode = () =>
    setViewMode((m) => {
      const next: ViewMode = m === "provider" ? "customer" : "provider";
      persistMode(next);
      return next;
    });

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
  
    // 1️⃣ authenticate
    const res = await API.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  
    // 2️⃣ store token
    localStorage.setItem("access_token", res.data.access_token);
    setToken(res.data.access_token);
  
    // 3️⃣ fetch user profile
    const { data: me } = await API.get("/users/me", {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    localStorage.setItem("user", JSON.stringify(me));
    setUser(me);
  
    // 4️⃣ decide default view
    const defaultMode: ViewMode = me.is_provider ? "provider" : "customer";
    setViewMode(defaultMode);
    persistMode(defaultMode);
  
    // 5️⃣ redirect
    router.push(
      defaultMode === "provider" ? "/dashboard/provider" : "/dashboard/customer"
    );
  };

  const register = async (data: any) => {
    await API.post("/users/register", data);
    router.push("/login");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("viewMode");
    setToken(null);
    setUser(null);
    setViewMode("customer");
    persistMode("customer");
    router.push("/login");
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("access_token") || token;
    if (!storedToken) return;

    try {
      const { data: me } = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      localStorage.setItem("user", JSON.stringify(me));
      setUser(me);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        viewMode,
        toggleViewMode,
        setViewMode: changeMode,
        login,
        register,
        logout,
        setUser,
        setToken,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
