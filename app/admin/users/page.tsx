"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  bvn?: string;
  id_type?: string;
  id_number?: string;
  id_photo_url?: string;
  identity_status?: string;
  is_active: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  is_provider?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ◉ NEW: reset-password modal state
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetError, setResetError] = useState("");

  // ◉ NEW: create-user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });
  const [createLoading, setCreateLoading] = useState(false);

  // ◉ NEW: make-provider modal state
  const [showProviderModal, setShowProviderModal] = useState<User | null>(null);
  const [providerData, setProviderData] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    open_hours: ""
  });
  const [providerLoading, setProviderLoading] = useState(false);

  const handleMakeProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProviderModal) return;
    setProviderLoading(true);
    try {
      await API.post(`/admin/users/${showProviderModal.id}/make-provider`, providerData);
      setUsers(prev => prev.map(u => u.id === showProviderModal.id ? { ...u, is_provider: true } : u));
      toast.success("✅ User is now a Provider!");
      setShowProviderModal(null);
      setProviderData({ business_name: "", business_address: "", business_phone: "", business_email: "", open_hours: "" });
    } catch (err: any) {
      if (err.response?.status === 422) {
        const details = err.response.data.detail;
        const msg = Array.isArray(details)
          ? details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ")
          : details;
        toast.error(`Validation Error: ${msg}`);
      } else {
        toast.error(err.response?.data?.detail || "❌ Failed to create provider profile.");
      }
    } finally {
      setProviderLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await API.post("/admin/users", newUser);
      setUsers(prev => [res.data, ...prev]);
      toast.success("✅ User created successfully!");
      setShowCreateModal(false);
      setNewUser({ first_name: "", last_name: "", email: "", phone: "", address: "", password: "" });
    } catch (err: any) {
      if (err.response?.status === 422) {
        const details = err.response.data.detail;
        const msg = Array.isArray(details)
          ? details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(", ")
          : details;
        toast.error(`Validation Error: ${msg}`);
      } else {
        toast.error(err.response?.data?.detail || "❌ Failed to create user.");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/make-admin`, {});
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: true } : u));
      toast.success("✅ User promoted to admin!");
    } catch (err) {
      console.error("Error promoting user", err);
      toast.error("❌ Failed to make admin.");
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/remove-admin`, {});
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: false } : u));
      toast.success("✅ Admin rights removed.");
    } catch (err) {
      console.error("Error removing admin", err);
      toast.error("❌ Failed to remove admin.");
    }
  };

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
    setIsSuperAdmin(payload?.is_super_admin === true);
    setCurrentUserId(payload?.sub || null);

    API.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => toast.error("Error fetching users"))
      .finally(() => setLoading(false));
  }, [token]);

  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await API.patch(`/admin/users/${userId}/deactivate`, {});
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, is_active: false } : user));
      toast.success("✅ User deactivated!");
    } catch (err) {
      console.error("Error deactivating user", err);
      toast.error("❌ Failed to deactivate user.");
    }
  };

  const deleteUserPermanently = async (userId: string) => {
    if (!confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone and will remove all associated data (services, bookings, etc).")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success("🔥 User permanently deleted.");
    } catch (err: any) {
      console.error("Error deleting user", err);
      toast.error(err.response?.data?.detail || "❌ Failed to delete user.");
    }
  };

  const activateUser = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/activate`, {});
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, is_active: true } : user));
      toast.success("✅ User reactivated!");
    } catch (err) {
      console.error("Error activating user", err);
      toast.error("❌ Failed to activate user.");
    }
  };

  // ◉ NEW: trigger admin-reset endpoint
  const handlePasswordReset = async () => {
    if (!resetUser) return;
    try {
      await API.patch(
        `/admin/users/${resetUser.id}/reset-password`,
        { new_password: resetPw }
      );
      toast.success(`Password reset for ${resetUser.email}`);
      setResetUser(null);
      setResetPw("");
    } catch (err) {
      console.error("Reset failed:", err);
      setResetError("Failed to reset password");
      toast.error("❌ Failed to reset password.");
    }
  };

  const verifyIdentity = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/verify-identity`, {});
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_identity_verified: true, identity_status: "verified" } : u));
      toast.success("✅ Identity verified!");
    } catch (err) {
      toast.error("❌ Failed to verify identity.");
    }
  };

  const rejectIdentity = async (userId: string) => {
    try {
      await API.patch(`/admin/users/${userId}/reject-identity`, {});
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_identity_verified: false, identity_status: "rejected" } : u));
      toast.success("🚫 Identity rejected.");
    } catch (err) {
      toast.error("❌ Failed to reject identity.");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "deactivated" && !user.is_active) ||
      (statusFilter === "admin" && user.is_admin) ||
      (statusFilter === "pending_id" && user.identity_status === "pending");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">👥 All Users</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap"
          >
            + Create User
          </button>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
            <option value="admin">Admins</option>
            <option value="pending_id">Pending ID</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found matching your criteria.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4 hidden md:table-cell">Identity Info</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-900/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    {user.is_admin && <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>}
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-xs space-y-2">
                       {user.id_type ? (
                         <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                           <p><span className="text-gray-500 font-bold uppercase text-[9px]">Type:</span> {user.id_type}</p>
                           <p><span className="text-gray-500 font-bold uppercase text-[9px]">Number:</span> {user.id_number}</p>
                           {user.id_photo_url && (
                             <a
                               href={user.id_photo_url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="mt-2 block text-cyan-400 hover:underline flex items-center gap-1"
                             >
                               View Photo ID
                             </a>
                           )}
                           <div className="mt-2 flex gap-1">
                             {user.identity_status === "pending" && (
                               <>
                                 <button
                                   onClick={() => verifyIdentity(user.id)}
                                   className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-[10px] hover:bg-green-600 hover:text-white transition"
                                 >
                                   Verify
                                 </button>
                                 <button
                                   onClick={() => rejectIdentity(user.id)}
                                   className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-[10px] hover:bg-red-600 hover:text-white transition"
                                 >
                                   Reject
                                 </button>
                               </>
                             )}
                           </div>
                         </div>
                       ) : (
                         <span className="text-gray-600 italic">No ID provided</span>
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {user.id === currentUserId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                          You
                        </span>
                      ) : user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 w-fit">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 w-fit">
                          Deactivated
                        </span>
                      )}

                      {user.identity_status === "verified" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-900/30 text-cyan-400 w-fit border border-cyan-500/30">
                          ID VERIFIED
                        </span>
                      )}
                      {user.identity_status === "pending" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/30 text-amber-400 w-fit border border-amber-500/30">
                          ID PENDING
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => {
                            setResetUser(user);
                            setResetPw("");
                            setResetError("");
                          }}
                          className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-indigo-600/30"
                        >
                          Reset Pw
                        </button>
                      )}

                      {user.id !== currentUserId &&
                        !user.is_super_admin &&
                        (user.is_active ? (
                          <button
                            onClick={() => deactivateUser(user.id)}
                            className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-yellow-600/30"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => activateUser(user.id)}
                              className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-emerald-600/30"
                            >
                              Activate
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => deleteUserPermanently(user.id)}
                                className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-red-600/30 font-bold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}

                      {user.id !== currentUserId &&
                        !user.is_super_admin &&
                        isSuperAdmin &&
                        (user.is_admin ? (
                          <button
                            onClick={() => removeAdmin(user.id)}
                            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-red-600/30"
                          >
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => makeAdmin(user.id)}
                            className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-cyan-600/30"
                          >
                            Make Admin
                          </button>
                        ))}

                      {user.id !== currentUserId && !user.is_provider && (
                        <button
                          onClick={() => {
                            setShowProviderModal(user);
                            setProviderData({
                              business_name: `${user.first_name} ${user.last_name}`,
                              business_address: user.address || "",
                              business_phone: user.phone || "",
                              business_email: user.email,
                              open_hours: "Mon-Fri: 9am-5pm"
                            });
                          }}
                          className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-purple-600/30"
                        >
                          Make Provider
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Make Provider Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-2">Upgrade to Provider</h2>
            <p className="text-gray-400 text-xs mb-6 font-medium uppercase tracking-wider">For: {showProviderModal.first_name} {showProviderModal.last_name}</p>

            <form onSubmit={handleMakeProvider} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Business Name</label>
                <input
                  required
                  value={providerData.business_name}
                  onChange={e => setProviderData({ ...providerData, business_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Business Address</label>
                <input
                  required
                  value={providerData.business_address}
                  onChange={e => setProviderData({ ...providerData, business_address: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Business Phone</label>
                  <input
                    required
                    value={providerData.business_phone}
                    onChange={e => setProviderData({ ...providerData, business_phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Business Email</label>
                  <input
                    type="email"
                    value={providerData.business_email}
                    onChange={e => setProviderData({ ...providerData, business_email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Working Hours</label>
                <input
                  required
                  value={providerData.open_hours}
                  onChange={e => setProviderData({ ...providerData, open_hours: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g. Mon-Fri: 9am-5pm"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(null)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={providerLoading}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition disabled:opacity-50"
                >
                  {providerLoading ? "Upgrading..." : "Confirm Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">First Name</label>
                  <input
                    required
                    value={newUser.first_name}
                    onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Last Name</label>
                  <input
                    required
                    value={newUser.last_name}
                    onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input
                  required
                  value={newUser.phone}
                  onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Home Address</label>
                <input
                  required
                  value={newUser.address}
                  onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 text-white rounded-xl p-6 w-[90%] max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Reset for {resetUser.email}
            </h2>

            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={resetPw}
              onChange={(e) => setResetPw(e.target.value)}
              minLength={8}
              className="w-full border border-gray-600 bg-gray-900 px-3 py-2 rounded text-gray-100 placeholder-gray-400"
            />
            {resetError && (
              <p className="text-red-400 text-sm">{resetError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetUser(null)}
                className="px-4 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={resetPw.length < 8}
                className="px-4 py-1 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}