"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { toast } from "react-hot-toast";

interface Dispute {
  id: string;
  service_name: string;
  customer_name: string;
  provider_name: string;
  dispute_reason: string;
  dispute_status: string;
  created_at: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;
    API.get("/admin/disputes")
      .then(res => setDisputes(res.data))
      .catch(() => toast.error("Failed to fetch disputes"))
      .finally(() => setLoading(false));
  }, [token]);

  const resolveDispute = async (id: string, action: string) => {
    if (!confirm(`Are you sure you want to mark this as ${action}?`)) return;
    try {
      await API.post(`/admin/bookings/${id}/resolve-dispute`, {}, { params: { action } });
      setDisputes(prev => prev.filter(d => d.id !== id));
      toast.success(`✅ Dispute ${action}`);
    } catch {
      toast.error("Failed to resolve dispute");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
         ⚠️ Customer Disputes
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-3xl border border-gray-800">
           <p className="text-gray-500">No open disputes found. Great job!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {disputes.map(d => (
            <div key={d.id} className="p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-lg font-bold text-cyan-400">{d.service_name}</h3>
                     <p className="text-xs text-gray-500">Job between <span className="font-bold text-gray-300">{d.provider_name}</span> & <span className="font-bold text-gray-300">{d.customer_name}</span></p>
                  </div>
                  <span className="px-3 py-1 bg-red-900/30 text-red-400 text-[10px] font-black uppercase rounded-lg border border-red-600/30">
                     Pending Admin Review
                  </span>
               </div>

               <div className="bg-black/40 p-4 rounded-xl border border-gray-800 mb-6">
                  <p className="text-sm italic text-gray-300">"{d.dispute_reason}"</p>
               </div>

               <div className="flex justify-end gap-3">
                  <button
                    onClick={() => resolveDispute(d.id, "resolved")}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Resolve (No Refund)
                  </button>
                  <button
                    onClick={() => resolveDispute(d.id, "refunded")}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Issue Refund
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
