"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProviderSetupPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [form, setForm] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    business_description: "",
    open_hours: "",
    image_url: ""
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, image_url: data.secure_url }));
        toast.success("Business logo uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/providers/setup", form);
      await refreshUser();
      toast.success("✅ Provider profile created! Awaiting admin approval.");
      setSuccess("✅ Provider profile created!");
      setTimeout(() => router.push("/providers/pending"), 1500);
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
          <h2 className="text-3xl font-bold text-blue-800 mb-4 text-center">Business Registration</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Provide your business details to start selling services.</p>

          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {form.image_url ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100 shadow-md">
                   <img src={form.image_url} alt="Logo" className="w-full h-full object-cover" />
                   <button
                     type="button"
                     onClick={() => setForm({...form, image_url: ""})}
                     className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                   >
                      <XMarkIcon className="w-3 h-3" />
                   </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition bg-gray-50">
                   <PhotoIcon className={`w-8 h-8 ${uploading ? 'animate-pulse text-blue-400' : 'text-gray-400'}`} />
                   <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Logo</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Business Name</label>
               <input
                 name="business_name"
                 placeholder="Business Name"
                 onChange={handleChange}
                 required
                 className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50"
               />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Business Phone</label>
               <input
                 name="business_phone"
                 placeholder="Phone (e.g. 080...)"
                 onChange={handleChange}
                 required
                 className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50"
               />
             </div>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Business Email</label>
             <input
               name="business_email"
               type="email"
               placeholder="Enter business email"
               onChange={handleChange}
               className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50"
             />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Business Address</label>
             <input
               name="business_address"
               placeholder="Physical location"
               onChange={handleChange}
               required
               className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50"
             />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Business Description</label>
             <textarea
               name="business_description"
               rows={3}
               placeholder="Describe what services you offer..."
               onChange={handleChange}
               className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50 resize-none"
             />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Opening Hours</label>
             <input
               name="open_hours"
               placeholder="e.g. Mon - Sat 8am - 6pm"
               onChange={handleChange}
               className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-50/50"
             />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 transition disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
