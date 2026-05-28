"use client";

import { useEffect, useState } from "react";
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
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, token, setUser, logout } = useAuth();

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", address: "",
    id_type: "", id_number: "", id_photo_url: "",
    business_name: "", business_address: "", business_phone: "", open_hours: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [editMode, setEditMode] = useState(false);

  const auth = (t: string | null) => ({ headers: { Authorization: `Bearer ${t}` } });

  const loadData = async () => {
    setLoading(true);
    try {
      const u = (await API.get("/users/me", auth(token))).data;
      setForm(f => ({ ...f,
        first_name: u.first_name, last_name: u.last_name,
        phone: u.phone, address: u.address ?? "",
        id_type: u.id_type ?? "", id_number: u.id_number ?? "", id_photo_url: u.id_photo_url ?? "",
      }));
      if (u.is_provider) {
        const p = (await API.get("/providers/me", auth(token))).data;
        setForm(f => ({ ...f,
          business_name: p.business_name,  business_address: p.business_address,
          business_phone: p.business_phone, open_hours: p.open_hours ?? ""
        }));
      }
    } catch { toast.error("Unable to load profile"); }
    setLoading(false);
  };
  useEffect(() => { if (token) loadData(); }, [token]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.put("/users/me", {
        first_name: form.first_name, last_name: form.last_name,
        phone: form.phone, address: form.address,
        id_type: form.id_type, id_number: form.id_number, id_photo_url: form.id_photo_url
      }, auth(token));
      if (user?.is_provider) {
        await API.put("/providers/me", {
          business_name: form.business_name, business_address: form.business_address,
          business_phone: form.business_phone, open_hours: form.open_hours,
        }, auth(token));
      }
      const fresh = (await API.get("/users/me", auth(token))).data;
      localStorage.setItem("user", JSON.stringify(fresh)); setUser(fresh);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch { toast.error("Update failed"); }
    setSaving(false);
  };

  const deactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? This action is permanent.")) return;
    try {
      await API.patch("/users/me/deactivate", {}, auth(token));
      logout();
    } catch {
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

  const renderInput = (label: string, name: string, icon: any) => (
    <div className="space-y-1.5" key={name}>
      <label htmlFor={name} className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
        <input
          id={name}
          name={name}
          placeholder={label}
          value={(form as any)[name]}
          onChange={handleChange}
          disabled={!editMode}
          className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all font-medium text-sm
                    ${editMode
                      ? "bg-white border-gray-200 focus:ring-2 focus:ring-cyan-400 text-gray-800"
                      : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"}`}
        />
      </div>
    </div>
  );

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
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                 <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-tight">Customer Account</span>
                 {user?.is_provider && <span className="px-3 py-1 bg-emerald-100 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Verified Provider</span>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition shadow-xl shadow-gray-200"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition shadow-xl shadow-cyan-100 disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => { setEditMode(false); loadData(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition"
                  >
                    <XMarkIcon className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <UserCircleIcon className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-lg font-black text-gray-900">Personal Details</h2>
                </div>
                <div className="space-y-4">
                  {renderInput("First Name", "first_name", <UserCircleIcon className="w-5 h-5 text-gray-400" />)}
                  {renderInput("Last Name", "last_name", <UserCircleIcon className="w-5 h-5 text-gray-400" />)}
                  {renderInput("Phone Number", "phone", <ShieldCheckIcon className="w-5 h-5 text-gray-400" />)}
                  {renderInput("Residential Address", "address", <UserCircleIcon className="w-5 h-5 text-gray-400" />)}
                </div>
              </div>

              {/* ID Verification Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-lg font-black text-gray-900">Identity Verification</h2>
                  </div>
                  {(user as any)?.identity_status === "verified" && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Verified</span>
                  )}
                  {(user as any)?.identity_status === "pending" && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pending Review</span>
                  )}
                  {(user as any)?.identity_status === "rejected" && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Rejected</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                  To build trust in the community, please provide a valid government ID. This is required for service providers.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="id_type" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Type</label>
                    <select
                      id="id_type"
                      name="id_type"
                      value={form.id_type}
                      onChange={handleChange}
                      disabled={!editMode || (user as any)?.identity_status === "verified"}
                      className={`w-full px-4 py-3.5 rounded-2xl border transition-all font-medium text-sm
                                ${editMode && (user as any)?.identity_status !== "verified"
                                  ? "bg-white border-gray-200 focus:ring-2 focus:ring-cyan-400 text-gray-800"
                                  : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"}`}
                    >
                      <option value="">Select ID Type</option>
                      <option value="NIN">National ID (NIN)</option>
                      <option value="BVN">BVN</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Voter's Card">Voter's Card</option>
                      <option value="Passport">International Passport</option>
                    </select>
                  </div>

                  {renderInput("ID Number", "id_number", <ShieldCheckIcon className="w-5 h-5 text-gray-400" />)}
                  {renderInput("ID Photo URL", "id_photo_url", <ShieldCheckIcon className="w-5 h-5 text-gray-400" />)}

                  {form.id_photo_url && (
                    <div className="mt-4 p-2 border border-gray-100 rounded-2xl bg-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">ID Preview</p>
                      <img src={form.id_photo_url} alt="ID Preview" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Info / CTA */}
            <div className="space-y-8">
              {user?.is_provider ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <BriefcaseIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-lg font-black text-gray-900">Business Profile</h2>
                  </div>
                  <div className="space-y-4">
                    {renderInput("Business Name", "business_name", <BriefcaseIcon className="w-5 h-5 text-gray-400" />)}
                    {renderInput("Business Address", "business_address", <BriefcaseIcon className="w-5 h-5 text-gray-400" />)}
                    {renderInput("Business Phone", "business_phone", <BriefcaseIcon className="w-5 h-5 text-gray-400" />)}
                    {renderInput("Open Hours", "open_hours", <BriefcaseIcon className="w-5 h-5 text-gray-400" />)}
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 text-white flex flex-col justify-center items-center text-center">
                  <BriefcaseIcon className="w-16 h-16 mb-4 opacity-50" />
                  <h2 className="text-xl font-black mb-2">Want to Sell Services?</h2>
                  <p className="text-indigo-100 text-sm mb-6 max-w-[200px]">Join our verified network of professionals today.</p>
                  <a href="/provider/setup" className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition">
                    Become a Provider
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] mb-4">Danger Zone</h3>
            <button
              onClick={deactivate}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm transition group"
            >
              <TrashIcon className="w-4 h-4 group-hover:animate-bounce" /> Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
