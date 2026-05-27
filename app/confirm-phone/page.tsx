"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ConfirmPhonePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem("pending_user_id");
    if (!userId) {
      toast.error("User session not found. Please register again.");
      router.push("/register");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/auth/confirm-phone", {
        user_id: userId,
        code,
      });
      toast.success("Phone verified successfully! You now have a verified badge.");
      localStorage.removeItem("pending_user_id");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto min-h-[60vh] flex flex-col justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">Verify Phone</h1>
        <p className="text-gray-500 text-center mb-8">
          Enter the 6-digit code sent to your phone number to complete your verification.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
            className="w-full text-center text-2xl tracking-[0.5em] p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 font-mono"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-xl transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Didn't receive a code?{" "}
          <button className="text-emerald-600 font-medium hover:underline">
            Resend Code
          </button>
        </p>
      </div>
    </main>
  );
}
