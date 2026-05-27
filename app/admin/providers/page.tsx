"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Provider {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  verified: boolean;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:8000/admin/providers", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProviders(res.data))
      .catch(err => {
        console.error("Error fetching providers", err);
        toast.error("❌ Failed to fetch providers.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const verifyProvider = async (providerId: string) => {
    try {
      await axios.post(`http://localhost:8000/admin/providers/${providerId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verified: true } : p));
      toast.success("✅ Provider verified!");
    } catch (err) {
      console.error("Verification failed", err);
      toast.error("❌ Failed to verify provider.");
    }
  };

  const deactivateProvider = async (providerId: string) => {
    if (!confirm("Are you sure you want to deactivate this provider?")) return;
    try {
      await axios.patch(`http://localhost:8000/admin/providers/${providerId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verified: false } : p));
      toast.success("🚫 Provider deactivated.");
    } catch (err) {
      console.error("Deactivation failed", err);
      toast.error("❌ Failed to deactivate provider.");
    }
  };

  const filteredProviders = providers.filter(p => {
    const matchesSearch =
      p.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.business_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && p.verified) ||
      (statusFilter === "pending" && !p.verified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">🧰 All Providers</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <input
            type="text"
            placeholder="Search business..."
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading providers...</p>
      ) : filteredProviders.length === 0 ? (
        <p>No providers found matching your criteria.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Business Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4 hidden md:table-cell">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProviders.map(p => (
                <tr key={p.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="p-4 font-semibold text-cyan-300">{p.business_name}</td>
                  <td className="p-4">
                    <div className="text-gray-300">{p.business_email}</div>
                    <div className="text-xs text-gray-500">{p.business_phone}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-400">{p.business_address}</td>
                  <td className="p-4">
                    {p.verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!p.verified ? (
                      <button
                        onClick={() => verifyProvider(p.id)}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-all text-xs px-3 py-1.5 rounded-lg border border-blue-600/30"
                      >
                        Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateProvider(p.id)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-all text-xs px-3 py-1.5 rounded-lg border border-red-600/30"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}