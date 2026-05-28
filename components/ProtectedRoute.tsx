"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If auth is still loading (user/token are not null/defined yet), wait
    // Note: useAuth should ideally have a 'loading' state
    if (user === null && token === null) return;

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

  return <React.Fragment>{children}</React.Fragment>;
}
