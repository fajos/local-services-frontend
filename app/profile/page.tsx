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
  ArrowUpTrayIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
}

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
    profile_photo_url: "",
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    business_description: "",
    open_hours: "",
    image_url: "",
    service_radius: 10,
    is_online: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortImage, setNewPortImage] = useState("");
  const [portLoading, setPortLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePortUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setNewPortImage(data.secure_url);
        toast.success("Portfolio image uploaded locally.");
      }
    } catch (err) {
      toast.error("Upload failed.");
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
        profile_photo_url: u.profile_photo_url ?? "",
      }));
      if (u.is_provider) {
        const p = (await API.get("/providers/me", { headers: { Authorization: `Bearer ${token}` } })).data;
        setForm(f => ({
          ...f,
          business_name: p.business_name || "",
          business_address: p.business_address || "",
          business_phone: p.business_phone || "",
          business_email: p.business_email || "",
          business_description: p.business_description || "",
          open_hours: p.open_hours ?? "",
          image_url: p.image_url ?? "",
          service_radius: p.service_radius ?? 10,
          is_online: p.is_online ?? true
        }));

        // Load Portfolio
        try {
          const port = (await API.get(`/providers/${p.id}/portfolio`)).data;
          setPortfolio(port);
        } catch (e) {
          console.warn("Portfolio load failed (likely empty)");
        }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPortfolio = async () => {
    if (!newPortImage) return;
    setPortLoading(true);
    try {
      const p = (await API.get("/providers/me")).data;
      await API.post(`/providers/${p.id}/portfolio`, {
        title: newPortTitle,
        image_url: newPortImage
      });
      toast.success("Portfolio item added!");
      setNewPortTitle("");
      setNewPortImage("");
      // reload portfolio
      const port = (await API.get(`/providers/${p.id}/portfolio`)).data;
      setPortfolio(port);
    } catch (err) {
      toast.error("Failed to add portfolio item");
    } finally {
      setPortLoading(false);
    }
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
        id_photo_url: form.id_photo_url,
        profile_photo_url: form.profile_photo_url
      }, headers);

      if (user?.is_provider) {
        await API.put("/providers/me", {
          business_name: form.business_name,
          business_address: form.business_address,
          business_phone: form.business_phone,
          business_email: form.business_email,
          business_description: form.business_description,
          open_hours: form.open_hours,
          image_url: form.image_url,
          service_radius: parseInt(form.service_radius.toString()),
          is_online: form.is_online
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
    if (!confirm("Are you sure you want to deactivate your account? This action is permanent and will hide your profile/services.")) return;
    try {
      await API.patch("/users/me/deactivate", {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Account deactivated.");
      logout();
    } catch (err) {
      toast.error("Could not deactivate account.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      await API.put("/users/me", { password: newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setPwLoading(false);
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
            <div className="relative group">
              {form.profile_photo_url ? (
                <img
                  src={form.profile_photo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg shadow-cyan-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-cyan-100">
                  {form.first_name?.[0]}{form.last_name?.[0]}
                </div>
              )}
              {editMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <ArrowUpTrayIcon className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
                      try {
                        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
                        const data = await res.json();
                        setForm(prev => ({ ...prev, profile_photo_url: data.secure_url }));
                        toast.success("Profile photo updated locally. Save to persist.");
                      } catch { toast.error("Upload failed"); } finally { setUploading(false); }
                    }}
                  />
                </label>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black text-gray-900">{form.first_name} {form.last_name}</h1>
                {user?.is_identity_verified && <VerifiedBadge className="w-6 h-6 text-blue-500" />}
              </div>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition"
              >
                <ShieldCheckIcon className="w-4 h-4" /> Change Password
              </button>
              {!editMode ? (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
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
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
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
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
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
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold text-gray-400 uppercase mb-1">Home Address</label>
                    <input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      placeholder="Enter your home address"
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
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
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
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
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
                              type="button"
                              aria-label="Remove image"
                              title="Remove image"
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
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Logo</label>
                      <div className="mt-2 flex items-center gap-4">
                        {form.image_url ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-gray-50">
                            <img
                              src={form.image_url}
                              alt="Business Logo"
                              className="w-full h-full object-cover"
                            />
                            {editMode && (
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, image_url: "" })}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <BriefcaseIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">NO LOGO</span>
                          </div>
                        )}

                        {editMode && (
                          <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition group">
                            <div className="flex flex-col items-center justify-center">
                              <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${uploading ? 'animate-bounce text-cyan-600' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                              <p className="text-[10px] font-bold text-gray-500 group-hover:text-cyan-600">
                                {uploading ? "UPLOADING..." : "UPLOAD LOGO"}
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
                                try {
                                  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
                                  const data = await res.json();
                                  setForm(prev => ({ ...prev, image_url: data.secure_url }));
                                  toast.success("Logo updated locally.");
                                } catch { toast.error("Upload failed"); } finally { setUploading(false); }
                              }}
                              accept="image/*"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="business_name" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Name</label>
                      <input
                        id="business_name"
                        name="business_name"
                        value={form.business_name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="business_email" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Email</label>
                      <input
                        id="business_email"
                        name="business_email"
                        value={form.business_email}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                        placeholder="Enter business email"
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
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="business_phone" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Phone</label>
                      <input
                        id="business_phone"
                        name="business_phone"
                        value={form.business_phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="business_description" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Description</label>
                      <textarea
                        id="business_description"
                        name="business_description"
                        value={form.business_description}
                        onChange={handleChange}
                        disabled={!editMode}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500 resize-none"
                        placeholder="Tell customers about your business"
                      />
                    </div>
                    <div>
                      <label htmlFor="open_hours" className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Hours</label>
                      <input
                        id="open_hours"
                        name="open_hours"
                        value={form.open_hours}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="service_radius" className="block text-xs font-bold text-gray-400 uppercase mb-1">Service Radius (km)</label>
                      <input
                        id="service_radius"
                        name="service_radius"
                        type="number"
                        value={form.service_radius}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 disabled:text-gray-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Online Status</label>
                        <p className="text-[10px] text-gray-500 font-medium">Toggle availability for new bookings</p>
                      </div>
                      <button
                        type="button"
                        disabled={!editMode}
                        onClick={() => setForm({ ...form, is_online: !form.is_online })}
                        className={`w-12 h-6 rounded-full transition relative ${form.is_online ? 'bg-cyan-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_online ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Section */}
              {user?.is_provider && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                   <h2 className="text-lg font-black text-gray-900 mb-6">Work Portfolio</h2>

                   {/* Add new item */}
                   <div className="mb-8 space-y-4 border-b pb-8 border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden">
                           {newPortImage ? (
                             <img src={newPortImage} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PhotoIcon className="w-8 h-8" />
                             </div>
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input
                              type="file"
                              id="port-file"
                              className="hidden"
                              accept="image/*"
                              onChange={handlePortUpload}
                           />
                           <label
                              htmlFor="port-file"
                              className="inline-block text-[10px] font-bold text-cyan-600 cursor-pointer hover:underline"
                           >
                              {newPortImage ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
                           </label>
                           <input
                              placeholder="Photo Title (e.g. Completed Kitchen)"
                              value={newPortTitle}
                              onChange={(e) => setNewPortTitle(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                           />
                        </div>
                      </div>
                      <button
                        onClick={addPortfolio}
                        disabled={!newPortImage || portLoading}
                        className="w-full py-2 bg-cyan-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                         <PlusIcon className="w-4 h-4" /> Add to Portfolio
                      </button>
                   </div>

                   {/* Gallery */}
                   <div className="grid grid-cols-2 gap-4">
                      {portfolio.map((item) => (
                        <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-video bg-gray-100 border">
                           <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-center">
                              <p className="text-white text-[10px] font-bold line-clamp-2 mb-1">{item.title}</p>
                              <button
                                onClick={async () => {
                                   if(!confirm("Remove this item?")) return;
                                   try {
                                      let providerId = user?.provider_id;
                                      if (!providerId) {
                                        const p = (await API.get("/providers/me")).data;
                                        providerId = p.id;
                                      }
                                      await API.delete(`/providers/${providerId}/portfolio/${item.id}`);
                                      setPortfolio(prev => prev.filter(p => p.id !== item.id));
                                      toast.success("Item removed");
                                   } catch { toast.error("Failed to remove"); }
                                }}
                                className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                              >
                                 <TrashIcon className="w-3 h-3" />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                   {portfolio.length === 0 && (
                     <p className="text-center text-xs text-gray-400 italic">Your portfolio is empty.</p>
                   )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={deactivate}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm transition"
            >
              <TrashIcon className="w-4 h-4" /> Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                   <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
             </div>
             <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">New Password</label>
                   <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition"
                   />
                </div>
                <button
                   type="submit"
                   disabled={pwLoading}
                   className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 transition disabled:opacity-50"
                >
                   {pwLoading ? "UPDATING..." : "CONFIRM NEW PASSWORD"}
                </button>
             </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
