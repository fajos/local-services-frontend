"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Booking {
  id: string;
  service_name: string;
  customer_name: string;
  provider_name: string;
  quote_price: number;
  booking_status: string;
  payment_status: string;
  admin_released: boolean;
}

export default function PendingPayoutsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;

    axios.get("http://localhost:8000/admin/bookings/paid", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setBookings(res.data))
      .catch(err => {
        console.error("Error fetching paid bookings", err);
        toast.error("❌ Failed to fetch pending payouts.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const releasePayout = async (bookingId: string) => {
    if (!confirm("Are you sure you want to release this payment to the provider?")) return;

    try {
      await axios.post(`http://localhost:8000/admin/bookings/${bookingId}/release`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      toast.success("✅ Payout initiated successfully!");
    } catch (err) {
      console.error("Payout failed", err);
      toast.error("❌ Failed to release payout.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold text-green-400 mb-4">💵 Pending Payouts</h1>
      <p className="text-gray-400 mb-6">Bookings marked as 'paid' by customers but not yet released to providers.</p>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-lg text-center border border-gray-800">
           <p className="text-gray-500">No pending payouts found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-800 text-left">
              <tr>
                <th className="p-3">Service</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount (₦)</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t border-gray-700 hover:bg-gray-900">
                  <td className="p-3 font-semibold text-cyan-300">{b.service_name}</td>
                  <td className="p-3 text-gray-300">{b.provider_name}</td>
                  <td className="p-3 text-gray-300">{b.customer_name}</td>
                  <td className="p-3 text-green-400 font-mono">{(b.quote_price).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => releasePayout(b.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      Release Payment
                    </button>
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