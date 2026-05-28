"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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

  const makeAdmin = async (userId: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/make-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: true } : u));
      toast.success("✅ User promoted to admin!");
    } catch (err) {
      console.error("Error promoting user", err);
      toast.error("❌ Failed to make admin.");
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/remove-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(err => toast.error("Error fetching users"))
      .finally(() => setLoading(false));
  }, [token]);

  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, is_active: false } : user));
      toast.success("✅ User deactivated!");
    } catch (err) {
      console.error("Error deactivating user", err);
      toast.error("❌ Failed to deactivate user.");
    }
  };

  const activateUser = async (userId: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${resetUser.id}/reset-password`,
        { new_password: resetPw },
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/verify-identity`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_identity_verified: true, identity_status: "verified" } : u));
      toast.success("✅ Identity verified!");
    } catch (err) {
      toast.error("❌ Failed to verify identity.");
    }
  };

  const rejectIdentity = async (userId: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/users/${userId}/reject-identity`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
                          <button
                            onClick={() => activateUser(user.id)}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all text-[10px] sm:text-xs px-3 py-1.5 rounded-lg border border-emerald-600/30"
                          >
                            Activate
                          </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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