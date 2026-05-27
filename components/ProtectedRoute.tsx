"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Delay protection check until auth is initialized
    if (user === null && token === null) return; // still loading...

    if (!user || !token) {
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [user, token, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}