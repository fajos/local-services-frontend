"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    try {
      const res = await axios.post("http://localhost:8000/admin/login", {
        username: email,
        password: password
      }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const token = res.data.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (!payload?.is_admin) {
        toast.error("❌ Access denied: not an admin.");
        return;
      }

      localStorage.setItem("access_token", token);

      setUser({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        is_provider: payload.is_provider,
        is_admin: payload.is_admin,
        is_super_admin: payload.is_super_admin,
        is_verified_provider: payload.is_verified_provider,
        provider_id: payload.provider_id || "",
        is_email_confirmed: payload.is_email_confirmed || false,
        is_phone_confirmed: payload.is_phone_confirmed || false,
        is_identity_verified: payload.is_identity_verified || false,
      });

      toast.success("✅ Admin login successful!");
      setTimeout(() => router.push("/admin/dashboard"), 800);

    } catch (err) {
      console.error("Login error:", err);
      toast.error("❌ Invalid credentials or server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-50 to-yellow-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl w-full max-w-md space-y-6 shadow-2xl border border-blue-100"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-700">🛡 Admin Login</h2>
        <p className="text-center text-gray-500">Enter your admin credentials</p>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
}