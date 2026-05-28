"use client";

import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
}
