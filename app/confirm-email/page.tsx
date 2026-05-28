"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import API from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

function ConfirmEmailContent() {
  const { logout } = useAuth();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const sent = params.get("sent") === "true";
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error" | "sent">("pending");

  useEffect(() => {
    if (sent) {
      setStatus("sent");
      return;
    }

    if (token) {
      API.post("/auth/confirm-email", { token })
        .then(() => {
          setStatus("success");
          toast.success("Email confirmed! You can now log in.");
        })
        .catch(() => {
          setStatus("error");
          toast.error("Invalid or expired token.");
        });
    }
  }, [token, sent]);

  const handleGoToLogin = () => {
    logout();
    router.push("/login");
  };

  if (!token && !sent) {
    return (
      <main className="p-6 max-w-md mx-auto text-center">
        <p className="text-red-600 font-semibold">Missing confirmation token.</p>
        <button
          onClick={handleGoToLogin}
          className="mt-4 text-emerald-600 hover:underline"
        >
          Go to Login
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-md mx-auto min-h-[50vh] flex flex-col justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        {status === "sent" && (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Check your email</h1>
            <p className="text-gray-500 mb-6">
              We've sent a confirmation link to your email address. Please click the link to verify your account.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        )}

        {status === "pending" && token && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600">Confirming your email...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Email Verified!</h1>
            <p className="text-gray-500 mb-6">
              Your email has been successfully verified. You can now access all features.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Log In
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Verification Failed</h1>
            <p className="text-gray-500 mb-6">
              The link is invalid or has expired. Please try resending the confirmation email.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
