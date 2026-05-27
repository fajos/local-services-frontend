"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProviderPendingPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-orange-100 flex flex-col items-center justify-center text-center px-6">
        <div className="bg-white border border-yellow-200 shadow-lg p-10 rounded-2xl max-w-xl">
          <h1 className="text-3xl font-bold text-yellow-700 mb-4">✅ Application Received</h1>
          <p className="text-gray-700 mb-4">
            Thank you{user?.first_name ? `, ${user.first_name}` : ""}! Your provider application has been received.
          </p>
          <p className="text-gray-600 mb-6">
            Our team will review your submission shortly. You’ll get access to the Provider Dashboard once you’re approved.
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}