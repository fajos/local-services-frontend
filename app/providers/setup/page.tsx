"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function ProviderSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [form, setForm] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    open_hours: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/providers/setup", form);
      toast.success("✅ Provider profile created! Awaiting admin approval.");
      setSuccess("✅ Provider profile created!");
      setTimeout(() => router.push("/provider/pending"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create provider profile.");
      setError("❌ Failed to create provider profile.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 p-6 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-blue-100 shadow-xl rounded-2xl p-8 w-full max-w-2xl space-y-5"
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-4">Become a Provider</h2>

          <input
            name="business_name"
            placeholder="Business Name"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
          />
          <input
            name="business_address"
            placeholder="Business Address"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
          />
          <input
            name="business_phone"
            placeholder="Business Phone Number"
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
          />
          <input
            name="business_email"
            placeholder="Business Email (Optional)"
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
          />
          <input
            name="open_hours"
            placeholder="Open Hours (e.g. Mon - Sat 8am - 6pm)"
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <div className="flex justify-center">

          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            Submit
          </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
