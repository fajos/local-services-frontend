"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token  = params.get("token") || "";
  const router = useRouter();

  const [pw, setPw]       = useState("");
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/auth/reset-password", { token, new_password: pw });
      setSent(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Invalid or expired link.");
    }
  };

  if (!token) {
    return (
      <main className="p-6 max-w-md mx-auto text-red-500">
        Missing reset token.
      </main>
    );
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      {sent ? (
        <p>
          Password updated! Redirecting to{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            login
          </Link>
          …
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}
          <input
            type="password"
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="New Password"
            className="w-full border px-3 py-2 rounded text-gray-800"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Reset Password
          </button>
        </form>
      )}
    </main>
  );
}
