"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/utils/categories";
import {
  SparklesIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const PRICE_TYPES = ["Fixed", "Negotiable", "Visit Required"];

export default function AddServicePage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price_type: "",
    price: "",
  });
  const [providerId, setProviderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token || !user?.is_provider) return;

    axios
      .get("http://localhost:8000/providers/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProviderId(res.data.id))
      .catch(() => router.push("/"));
  }, [token, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!providerId) {
      setError("Provider profile not found.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price_type: form.price_type,
        ...(form.price_type === "Fixed" && form.price ? { price: parseInt(form.price) } : {}),
        provider_id: providerId,
      };

      await axios.post("http://localhost:8000/services/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Service published successfully!");
      setTimeout(() => router.push("/dashboard/provider"), 1500);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-indigo-100">
            <header className="mb-10 text-center">
              <div className="inline-block p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-gray-900">List a New Service</h1>
              <p className="text-gray-500 mt-2 font-medium">Reach more customers by adding your expertise</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Service Title</label>
                <div className="relative group">
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Professional House Cleaning"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium bg-white appearance-none"
                >
                  <option value="">-- Choose Category --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Description</label>
                <div className="relative group">
                  <DocumentTextIcon className="absolute left-4 top-6 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <textarea
                    name="description"
                    placeholder="What does this service include? Be specific..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium resize-none"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Price Model</label>
                  <select
                    name="price_type"
                    value={form.price_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium bg-white"
                  >
                    <option value="">-- Select Model --</option>
                    {PRICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {form.price_type === "Fixed" && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">Base Price (₦)</label>
                    <div className="relative group">
                      <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={form.price}
                        onChange={handleChange}
                        required={form.price_type === "Fixed"}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Publishing..." : "Publish Service"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
