"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.push("/admin/login");
    } else if (!user.is_admin) {
      router.push("/");
    }
  }, [user, token, loading, router]);

  if (loading || !user || !token || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
}
