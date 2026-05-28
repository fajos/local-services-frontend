"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlusIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon
} from "@heroicons/react/24/outline";

interface RegisterResponse {
  user_id: string;
  confirmation: "email" | "phone";
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name:  "",
    email:      "",
    password:   "",
    phone:      "",
    address:    "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post<RegisterResponse>(
        "/auth/register",
        {
          ...form,
          email: form.email || undefined,
          phone: form.phone || undefined,
        }
      );

      if (res.data.confirmation === "email") {
        router.push("/confirm-email?sent=true");
      } else {
        localStorage.setItem("pending_user_id", res.data.user_id);
        router.push("/confirm-phone");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl border border-emerald-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <UserPlusIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join our community of professionals and clients</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="first_name"
                placeholder="First Name"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
              />
            </div>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="last_name"
                placeholder="Last Name"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="Email (required for verification)"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="phone"
              placeholder="Phone Number (e.g., +23480...)"
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
            />
          </div>

          {/* Address */}
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="address"
              placeholder="Residential Address"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="Create Password"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Join the Marketplace"}
          </button>

          <p className="text-center text-sm text-gray-500 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
