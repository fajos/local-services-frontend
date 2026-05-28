"use client";

import React, { useEffect, useState } from "react";
import API from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  UserCircleIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, token, setUser, logout } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    id_type: "",
    id_number: "",
    id_photo_url: "",
    business_name: "",
    business_address: "",
    business_phone: "",
    open_hours: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, id_photo_url: data.secure_url }));
        toast.success("ID Document uploaded!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed. Please check your configuration.");
    } finally {
      setUploading(false);
    }
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const u = (await API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })).data;
      setForm(f => ({
        ...f,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        phone: u.phone || "",
        address: u.address ?? "",
        id_type: u.id_type ?? "",
        id_number: u.id_number ?? "",
        id_photo_url: u.id_photo_url ?? "",
      }));
      if (u.is_provider) {
        const p = (await API.get("/providers/me", { headers: { Authorization: `Bearer ${token}` } })).data;
        setForm(f => ({
          ...f,
          business_name: p.business_name || "",
          business_address: p.business_address || "",
          business_phone: p.business_phone || "",
          open_hours: p.open_hours ?? ""
        }));
      }
    } catch (err) {
      toast.error("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setSaving(true);
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await API.put("/users/me", {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        id_type: form.id_type,
        id_number: form.id_number,
        id_photo_url: form.id_photo_url
      }, headers);

      if (user?.is_provider) {
        await API.put("/providers/me", {
          business_name: form.business_name,
          business_address: form.business_address,
          business_phone: form.business_phone,
          open_hours: form.open_hours,
        }, headers);
      }

      const fresh = (await API.get("/users/me", headers)).data;
      localStorage.setItem("user", JSON.stringify(fresh));
      setUser(fresh);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? This action is permanent.")) return;
    try {
      await API.patch("/users/me/deactivate", {}, { headers: { Authorization: `Bearer ${token}` } });
      logout();
    } catch (err) {
      toast.error("Could not deactivate account.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Loading Profile</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-cyan-100">
              {form.first_name?.[0]}{form.last_name?.[0]}
            </div>
            <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black text-gray-900">{form.first_name} {form.last_name}</h1>
                {user?.is_identity_verified && <VerifiedBadge className="w-6 h-6 text-blue-500" />}
              </div>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => { setEditMode(false); loadData(); }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Personal Info */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-6">Personal Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="first_name" className="block text-xs font-bold text-gray-400 uppercase mb-1">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-gray-900">Identity Verification</h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user?.identity_status === 'verified' ? 'bg-green-100 text-green-700' :
                    user?.identity_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    user?.identity_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user?.identity_status || 'unverified'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="id_type" className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Type</label>
                    <select
                      id="id_type"
                      name="id_type"
                      value={form.id_type}
                      onChange={handleChange}
                      disabled={!editMode || user?.identity_status === "verified"}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select ID Type</option>
                      <option value="NIN">National ID (NIN)</option>
                      <option value="BVN">BVN</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Voter's Card">Voter's Card</option>
                      <option value="Passport">International Passport</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="id_number" className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Number</label>
                    <input
                      id="id_number"
                      name="id_number"
                      value={form.id_number}
                      onChange={handleChange}
                      disabled={!editMode || user?.identity_status === "verified"}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Photo Document</label>
                    <div className="mt-2 flex items-center gap-4">
                      {form.id_photo_url ? (
                        <div className="relative w-32 h-20 rounded-xl overflow-hidden border bg-gray-50">
                          <img
                            src={form.id_photo_url}
                            alt="Identity Document"
                            className="w-full h-full object-cover"
                          />
                          {editMode && user?.identity_status !== "verified" && (
                            <button
                              onClick={() => setForm({ ...form, id_photo_url: "" })}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                          <PhotoIcon className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold">NO DOCUMENT</span>
                        </div>
                      )}

                      {editMode && user?.identity_status !== "verified" && (
                        <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition group">
                          <div className="flex flex-col items-center justify-center">
                            <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${uploading ? 'animate-bounce text-cyan-600' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                            <p className="text-[10px] font-bold text-gray-500 group-hover:text-cyan-600">
                              {uploading ? "UPLOADING..." : "UPLOAD ID"}
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400 leading-relaxed font-medium">
                      Upload a clear photo of your government-issued ID. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Business Info */}
              {user?.is_provider && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-black text-gray-900 mb-6">Business Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="business_name" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Name</label>
                      <input
                        id="business_name"
                        name="business_name"
                        value={form.business_name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="business_address" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Address</label>
                      <input
                        id="business_address"
                        name="business_address"
                        value={form.business_address}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={deactivate}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm transition"
            >
              <TrashIcon className="w-4 h-4" /> Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
