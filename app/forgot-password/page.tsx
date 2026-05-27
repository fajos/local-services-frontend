"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios.post("http://localhost:8000/auth/forgot-password", { email });
    setSent(true);
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      {sent ? (
        <p>
          If that email exists, you’ll receive a reset link shortly.{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            ← Back to login
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border px-3 py-2 rounded text-gray-800"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Send Reset Link
          </button>
        </form>
      )}
    </main>
  );
}
