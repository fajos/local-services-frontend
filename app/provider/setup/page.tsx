"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import {
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function ProviderSetupPage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();

  // Redirect if already a provider
  if (user?.is_provider) {
    router.replace(user.is_verified_provider ? "/dashboard/provider" : "/provider/pending");
    return null;
  }

  const [form, setForm] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    open_hours: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/providers/setup", form);

      await refreshUser();
      toast.success("✅ Application submitted! Review in progress.");
      setTimeout(() => router.push("/provider/pending"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Submission failed.");
      setError("❌ Failed to create provider profile. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-blue-100 px-4 py-12 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-2xl rounded-3xl p-6 sm:p-10 w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6 transform -rotate-3">
              <BriefcaseIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Apply to Become <br/> a Verified Provider</h2>
            <p className="text-gray-500 mt-4 text-sm font-medium max-w-md mx-auto">
              Showcase your skills to thousands of local customers. Verification takes less than 24 hours.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative group">
                <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="business_name"
                  placeholder="Official Business or Brand Name"
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                />
              </div>

              <div className="relative group">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="business_address"
                  placeholder="Business Physical Address"
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    name="business_phone"
                    placeholder="Work Phone"
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                  />
                </div>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    name="business_email"
                    type="email"
                    placeholder="Work Email"
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="relative group">
                <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="open_hours"
                  placeholder="Business Hours (e.g. Mon - Sat, 8am - 6pm)"
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <CheckBadgeIcon className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-400 uppercase tracking-widest font-bold">
              Secure & Professional Marketplace
            </p>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
