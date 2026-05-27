/* ---------- app/(dashboard)/dashboard/customer/page.tsx ---------- */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReviewModal from "@/components/ReviewModal";
import {
  SparklesIcon,
  XMarkIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";

/* ---------- types ---------- */
interface Booking {
  id: string;
  service_name: string;
  service_category: string;
  provider_name: string;
  booking_status: string;
  quote_status: string;
  quote_price?: number;
  payment_status: string;
  created_at: string;
  reviewed?: boolean;
}

interface ReviewDraft {
  bookingId: string;
  rating: number;
  comment: string;
}

/* ---------- component ---------- */
export default function CustomerDashboard() {
  /* state & hooks -------------------------------------------------- */
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>({
    bookingId: "",
    rating: 5,
    comment: "",
  });

  /* helpers -------------------------------------------------------- */
  const handleCancel = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:8000/bookings/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Failed to cancel booking.");
    }
  };

  const handleAcceptQuote = async (id: string) => {
    try {
      await axios.post(
        `http://localhost:8000/bookings/${id}/accept-quote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, quote_status: "accepted" } : b
        )
      );
      alert("✅ Quote accepted! You can pay now.");
    } catch {
      alert("Could not accept quote.");
    }
  };

  const handleDeclineQuote = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:8000/bookings/${id}/decline-quote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, quote_status: "declined" } : b
        )
      );
    } catch {
      alert("Could not decline quote.");
    }
  };

  const handlePayNow = async (id: string) => {
    if (!confirm("Proceed to pay for this booking?")) return;
    try {
      await axios.post(
        `http://localhost:8000/bookings/${id}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, payment_status: "paid" } : b))
      );
      alert("✅ Payment successful!");
    } catch {
      alert("❌ Payment failed.");
    }
  };

  /* fetch once ----------------------------------------------------- */
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:8000/bookings/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]));
  }, [token]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  /* UI ------------------------------------------------------------- */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50 to-fuchsia-100 px-4 py-8 text-sm text-gray-800">
        {/* greeting */}
        <h1 className="text-2xl font-bold text-fuchsia-700 mb-8 flex items-center gap-1">
          <SparklesIcon className="w-6 h-6 text-fuchsia-500" />
          Welcome{user?.first_name ? `, ${user.first_name}` : ""}!
        </h1>

        {/* bookings section */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-cyan-700 mb-4 flex items-center gap-1">
            <SparklesIcon className="w-5 h-5 text-cyan-500" />
            Your Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">
              You have no bookings yet.{" "}
              <Link href="/" className="text-cyan-600 hover:underline">
                Browse services →
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-xl bg-white/90 backdrop-blur-lg border-l-[6px] border-cyan-400 shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* header row */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-cyan-700 leading-tight">
                          {b.service_name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {b.service_category}
                        </p>
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                          <span className="font-bold">Provider:</span> {b.provider_name}
                        </div>
                      </div>

                      {/* status + price */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`badge ${badgeColor(b.booking_status)}`}>
                            {b.booking_status}
                          </span>
                          <span className={`badge ${badgeColor(b.payment_status)}`}>
                            {b.payment_status}
                          </span>
                        </div>
                        {b.quote_price != null && (
                          <p className="text-sm font-black text-emerald-600">
                            ₦{b.quote_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      {/* cancel */}
                      {b.booking_status.toLowerCase() === "pending" && (
                        <button onClick={() => handleCancel(b.id)} className="w-full sm:w-auto px-6 py-2 border border-red-200 text-red-600 rounded-xl font-bold text-xs transition active:scale-95">
                          Cancel Request
                        </button>
                      )}

                      {/* quote actions */}
                      {b.quote_price != null &&
                        b.quote_status.toLowerCase() === "pending" && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => handleAcceptQuote(b.id)} className="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-95">
                              Accept Quote
                            </button>
                            <button onClick={() => handleDeclineQuote(b.id)} className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold text-xs transition active:scale-95">
                              Decline
                            </button>
                          </div>
                        )}

                      {/* pay now */}
                      {b.quote_status.toLowerCase() === "accepted" &&
                        b.payment_status.toLowerCase() === "unpaid" && (
                          <button onClick={() => handlePayNow(b.id)} className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2">
                            <WalletIcon className="w-4 h-4" />
                            Pay Now
                          </button>
                        )}

                      {/* review */}
                      {b.booking_status.toLowerCase() === "completed" &&
                        b.payment_status.toLowerCase() === "paid" &&
                        !b.reviewed && (
                          <button
                            onClick={() => {
                              setDraft({
                                bookingId: b.id,
                                rating: 5,
                                comment: "",
                              });
                              setShowReview(true);
                            }}
                            className="w-full sm:w-auto px-6 py-2 bg-violet-600 text-white rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            Leave Review
                          </button>
                        )}

                      <div className="sm:ml-auto flex items-center">
                        <p className="text-[10px] text-gray-400 font-medium">
                          {formatDate(b.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* review overlay ------------------------------------------- */}
        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                Rate this service
              </h3>

              {/* rating stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                    className={
                      n <= draft.rating
                        ? "text-yellow-400 text-2xl"
                        : "text-gray-300 text-2xl"
                    }
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* comment */}
              <textarea
                rows={3}
                placeholder="Optional comment..."
                value={draft.comment}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, comment: e.target.value }))
                }
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              {/* actions */}
              <div className="flex justify-end gap-3 text-sm">
                <button
                  onClick={() => setShowReview(false)}
                  className="flex items-center gap-1 text-gray-600 hover:underline"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        "http://localhost:8000/reviews/",
                        {
                          booking_id: draft.bookingId,
                          rating: draft.rating,
                          comment: draft.comment || null,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setBookings((prev) =>
                        prev.map((b) =>
                          b.id === draft.bookingId ? { ...b, reviewed: true } : b
                        )
                      );
                      setShowReview(false);
                      alert("✅ Thanks for your review!");
                    } catch {
                      alert("❌ Could not submit review.");
                    }
                  }}
                  className="btn-emerald"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

/* ---------- helpers ---------- */
function badgeColor(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "accepted":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "declined":
      return "bg-red-100 text-red-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "unpaid":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/* ---------- tailwind shortcuts ---------- */
export const badge =
  "inline-block px-2 py-[2px] rounded-full whitespace-nowrap font-medium";

const btnBase =
  "inline-flex items-center gap-1 px-3 py-[2px] text-[11px] font-semibold rounded-full transition active:scale-95";

/* as‑const → keeps literal types, nice autocompletion */
export const btn = {
  emerald: `${btnBase} bg-emerald-600 hover:bg-emerald-700 text-white`,
  fuchsia: `${btnBase} bg-fuchsia-600 hover:bg-fuchsia-700 text-white`,
  violet: `${btnBase} bg-violet-600 hover:bg-violet-700 text-white`,
  red: `${btnBase} bg-red-500 hover:bg-red-600 text-white`,
  gray: `${btnBase} border border-gray-400 text-gray-700 hover:bg-gray-100`,
} as const;