/* -------------------- pages/(dashboard)/provider/DashboardPage.tsx -------------------- */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Chat from "@/components/Chat";
import {
  SparklesIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";
import { CATEGORIES } from "@/utils/categories";


/* ---------- types ---------- */
interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price_type: string;
  price?: number;
  provider: {
    business_name: string;
    average_rating?: number; // int * 100
    reviews_count?: number;
  };
}

interface Booking {
  id: string;
  service_name: string;
  service_category: string;
  customer_name: string;
  note?: string;
  city_or_lga: string;
  booking_status: string;
  quote_status: string;
  quote_price?: number;
  payment_status: string;
  created_at: string;
  customer_info?: {
    phone: string;
    address?: string;
  } | null;
  has_customer_review?: boolean;
  is_recurring?: boolean;
  frequency?: string;
}

/* ---------- component ---------- */
export default function DashboardPage() {
  /* state & hooks ---------------------------------------------------- */
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  const [flash, setFlash] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "reviews">("bookings");
  const [reviews, setReviews] = useState<any[]>([]);

  const { user, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  /* ✨ edit‑modal state */
  const [editing, setEditing] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "Cleaning",
    description: "",
    price_type: "Fixed",
    price: "",
  });

  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  const [showRateCustomer, setShowRateCustomer] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [responseMsg, setResponseMsg] = useState("");
  const [rateData, setRateData] = useState({
    bookingId: "",
    customerName: "",
    rating: 5,
    comment: ""
  });

  /* ---------- DELETE helper ---------- */
  const deleteService = async (id: string) => {
    if (!confirm("Delete this service? This can’t be undone.")) return;
    try {
      await API.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setFlash("Service deleted.");
    } catch {
      alert("Failed to delete service.");
    }
  };


/* ---------- OPEN edit modal ---------- */
const openEditModal = (svc: Service) => {
  setEditing(svc);
  setEditForm({
    name: svc.name,
    category: svc.category,
    description: svc.description,
    price_type: svc.price_type,
    price: svc.price?.toString() || "",
  });
};

/* ---------- UPDATE handler ---------- */
const saveEdits = async () => {
  if (!editing) return;
  try {
    await API.patch(`/services/${editing.id}`, {
      name: editForm.name,
      category: editForm.category,
      description: editForm.description,
      price_type: editForm.price_type,
      price:
        editForm.price_type === "Fixed" && editForm.price
          ? Number(editForm.price)
          : null,
    });
    // refresh list locally
    setServices((prev) =>
      prev.map((s) =>
        s.id === editing.id
          ? {
              ...s,
              name: editForm.name,
              category: editForm.category,
              description: editForm.description,
              price_type: editForm.price_type,
              price:
                editForm.price_type === "Fixed" && editForm.price
                  ? Number(editForm.price)
                  : undefined,
            }
          : s,
      ),
    );
    setEditing(null);
    setFlash("Service saved successfully!");
  } catch {
    alert("Failed to update service.");
  }
};

// auto-clear flash after 3s
useEffect(() => {
  if (!flash) return;
  const t = setTimeout(() => setFlash(null), 3000);
  return () => clearTimeout(t);
}, [flash]);

  /* CRUD helpers (unchanged) ---------------------------------------- */
  const handleAccept = async (id: string) => {
    try {
      await API.post(`/bookings/${id}/accept-booking`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: "accepted" } : b))
      );
    } catch {
      alert("Failed to accept booking");
    }
  };

  const handleMarkEnRoute = async (id: string) => {
    try {
      await API.post(`/bookings/${id}/mark-en-route`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: "en_route" } : b))
      );
    } catch {
      alert("Failed to update status to en route");
    }
  };

  const handleStartJob = async (id: string) => {
    try {
      await API.post(`/bookings/${id}/mark-in-progress`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: "in-progress" } : b))
      );
    } catch {
      alert("Failed to start job");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await API.post(`/bookings/${id}/mark-complete`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, booking_status: "completed" } : b
        )
      );
    } catch {
      alert("Failed to mark complete");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await API.post(`/bookings/${id}/decline-booking`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: "declined" } : b))
      );
    } catch {
      alert("Failed to decline booking");
    }
  };

  const handleRateCustomerSubmit = async () => {
    try {
      await API.post(`/bookings/${rateData.bookingId}/rate-customer`, {
        rating: rateData.rating,
        comment: rateData.comment || null
      });
      setShowRateCustomer(false);
      alert("✅ Customer rated successfully!");
      // reload
      const res = await API.get("/bookings/provider/me");
      setBookings(res.data);
    } catch {
      alert("❌ Failed to rate customer.");
    }
  };

  const handleRespondSubmit = async () => {
    if (!responseMsg) return;
    try {
      await API.post(`/reviews/${selectedReview.id}/respond`, {
        response: responseMsg
      });
      setShowRespondModal(false);
      setResponseMsg("");
      alert("✅ Response posted!");
      // reload reviews
      const p = (await API.get("/providers/me")).data;
      const res = await API.get(`/reviews/provider/${p.id}`);
      setReviews(res.data);
    } catch {
      alert("❌ Failed to post response.");
    }
  };

  function glowColor(pt: string) {
    switch (pt) {
      case "Fixed":
        return "bg-emerald-100 text-emerald-800 shadow-emerald-200/60";
      case "Negotiable":
        return "bg-fuchsia-100 text-fuchsia-800 shadow-fuchsia-200/60";
      default:
        return "bg-violet-100 text-violet-800 shadow-violet-200/60";
    }
  }

  const promptSendQuote = async (id: string) => {
    const amount = prompt("Enter quote amount (₦):");
    if (!amount) return;
    try {
      await API.post(`/bookings/${id}/send-quote`, {}, {
        params: { quote_price: parseInt(amount, 10) },
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, quote_price: parseInt(amount, 10), quote_status: "pending" }
            : b
        )
      );
    } catch {
      alert("Failed to send quote");
    }
  };

  /* bootstrap queries ----------------------------------------------- */
  useEffect(() => {
    if (!token || !user?.is_provider || !user?.is_verified_provider) return;

    API.get("/providers/me")
      .then((res) => {
         const p = res.data;
         API.get(`/reviews/provider/${p.id}`).then(r => setReviews(r.data));
      })
      .catch(() => router.push("/"));

    API.get("/services/me")
      .then((res) => setServices(res.data));

    API.get("/bookings/provider/me")
      .then((res) => setBookings(res.data));
  }, [token, user]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  /* if not a provider or not verified ----------------------------------------- */
  if (user && (!user.is_provider || !user.is_verified_provider)) {
    router.replace("/dashboard/customer");
    return null;
  }

  /* dashboard UI ----------------------------------------------------- */
  return (
    <ProtectedRoute>
      {/* Floating flash banner */}
      {flash && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {flash}
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-white via-lime-50 to-emerald-100 px-4 py-8 md:px-10 text-sm text-gray-800">

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto mb-10 flex gap-4 overflow-x-auto pb-2">
           {[
             { id: "bookings", label: "Bookings", icon: SparklesIcon },
             { id: "services", label: "Services", icon: PlusCircleIcon },
             { id: "reviews", label: "Reviews", icon: CheckBadgeIcon }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition whitespace-nowrap ${
                 activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-700 border border-emerald-100'
               }`}
             >
                <tab.icon className="w-5 h-5" />
                {tab.label}
             </button>
           ))}
        </div>

        {/* services section */}
        {activeTab === "services" && (
          <section className="max-w-6xl mx-auto mb-14">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-1">
              <SparklesIcon className="w-5 h-5 text-emerald-500" /> My Services
            </h2>
            <Link
              href="/add-service"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg active:scale-95 transition"
            >
              <PlusCircleIcon className="w-4 h-4" /> Add Service
            </Link>
          </header>

          {services.length === 0 ? (
            <p className="text-gray-500">You haven’t added any services yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="group relative rounded-2xl bg-white/90 backdrop-blur-lg border border-emerald-200 shadow-lg hover:shadow-xl hover:-translate-y-[3px] transition-all">
                  {/* ribbon ... */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-emerald-700">{s.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-3 my-1">{s.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="chip bg-emerald-100 text-emerald-800">{s.category}</span>
                      <span className={`px-2 py-[2px] rounded-full font-semibold shadow ${glowColor(s.price_type)}`}>{s.price_type}</span>
                      {s.price_type === "Fixed" && s.price != null && (
                        <span className="chip bg-violet-100 text-violet-800">₦{s.price}</span>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEditModal(s)} className="p-[6px] rounded-full bg-blue-50 hover:bg-blue-100 shadow"><PencilSquareIcon className="w-4 h-4 text-blue-600" /></button>
                        <button onClick={() => deleteService(s.id)} className="p-[6px] rounded-full bg-red-50 hover:bg-red-100 shadow"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                      </div>
                      <Link href={`/services/${s.id}`} className="ml-auto text-cyan-600 hover:underline">Details →</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* --- bookings section -------------------------------------- */}
        {activeTab === "bookings" && (
          <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-fuchsia-700 mb-4 flex items-center gap-1">
            <SparklesIcon className="w-5 h-5 text-fuchsia-500" />
            Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-xl bg-white/90 backdrop-blur-lg border-l-[6px] border-violet-400 shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* header row */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-violet-700 leading-tight">
                          {b.service_name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {b.service_category}
                        </p>

                        {b.note && (
                          <div className="mt-2 p-2 bg-violet-50/50 rounded-lg border border-violet-100">
                            <p className="italic text-xs text-gray-700">
                              “{b.note}”
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="text-[11px] text-gray-600 flex items-center gap-1">
                            <span>📍</span> {b.city_or_lga}
                          </div>
                          {b.customer_info && (
                            <div className="text-[11px] text-gray-600 flex items-center gap-1">
                              <span>📞</span> {b.customer_info.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* status badges & price */}
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
                      {b.quote_price == null &&
                      b.booking_status.toLowerCase() === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAccept(b.id)}
                            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleDecline(b.id)}
                            className="w-full sm:w-auto px-6 py-2 border border-red-200 text-red-600 rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => promptSendQuote(b.id)}
                            className="w-full sm:w-auto px-6 py-2 bg-fuchsia-600 text-white rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            Send Quote
                          </button>
                        </>
                      ) : b.quote_status.toLowerCase() === "pending" ? (
                        <div className="w-full text-center sm:text-left py-2 px-4 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                          Waiting for customer response...
                        </div>
                      ) : null}

                      {b.booking_status.toLowerCase() === "accepted" && (
                        <button
                          onClick={() => handleMarkEnRoute(b.id)}
                          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <PlayIcon className="w-3 h-3" /> Start Driving
                        </button>
                      )}

                      {b.booking_status.toLowerCase() === "en_route" && (
                         <button
                           onClick={() => handleStartJob(b.id)}
                           className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1"
                         >
                           <PlayIcon className="w-3 h-3" /> Arrived / Start Job
                         </button>
                      )}

                      {b.booking_status.toLowerCase() === "in-progress" && (
                        <button
                          onClick={() => handleComplete(b.id)}
                          className="w-full sm:w-auto px-6 py-2 bg-violet-600 text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <CheckBadgeIcon className="w-3 h-3" /> Mark Completed
                        </button>
                      )}

                      {b.booking_status.toLowerCase() === "completed" && !b.has_customer_review && (
                        <button
                          onClick={() => {
                            setRateData({ bookingId: b.id, customerName: b.customer_name, rating: 5, comment: "" });
                            setShowRateCustomer(true);
                          }}
                          className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-95"
                        >
                          Rate Customer
                        </button>
                      )}

                      <button
                        onClick={() => setActiveChat({ id: b.id, name: b.customer_name })}
                        className="w-full sm:w-auto px-6 py-2 border border-violet-200 text-violet-600 rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Message
                      </button>

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
        {activeTab === "reviews" && (
           <section className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                 <CheckBadgeIcon className="w-6 h-6" /> Your Reviews
              </h2>
              {reviews.length === 0 ? (
                 <p className="text-gray-500 bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center uppercase font-black text-xs">No reviews yet</p>
              ) : (
                 <div className="grid gap-6">
                    {reviews.map(r => (
                       <article key={r.id} className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <p className="font-black text-gray-900 text-lg">⭐ {r.rating}/5</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">From {r.customer_name} for {r.service_name}</p>
                             </div>
                             <p className="text-[10px] text-gray-300 font-bold uppercase">{formatDate(r.created_at)}</p>
                          </div>
                          <p className="text-gray-700 italic mb-6">"{r.comment || 'No comment provided.'}"</p>

                          {r.provider_response ? (
                             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 border-l-4 border-l-emerald-500">
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Your Response:</p>
                                <p className="text-sm text-emerald-800">{r.provider_response}</p>
                             </div>
                          ) : (
                             <button
                               onClick={() => { setSelectedReview(r); setShowRespondModal(true); }}
                               className="px-6 py-2 border border-emerald-200 text-emerald-600 rounded-xl font-black text-xs uppercase hover:bg-emerald-50 transition"
                             >
                                Respond to Review
                             </button>
                          )}
                       </article>
                    ))}
                 </div>
              )}
           </section>
        )}
      </div>

      {/* chat overlay --------------------------------------------- */}
      {activeChat && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm px-4 md:px-0">
          <Chat
            bookingId={activeChat.id}
            recipientName={activeChat.name}
            onClose={() => setActiveChat(null)}
          />
        </div>
      )}

      {/* Respond to Review Modal ------------------------------------ */}
      {showRespondModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
           <div className="w-[90%] max-w-md bg-white rounded-3xl p-8 space-y-6 shadow-2xl">
              <div>
                 <h3 className="text-xl font-black text-gray-900 mb-1">Reply to {selectedReview?.customer_name}</h3>
                 <p className="text-xs text-gray-500">Professional responses build trust with future customers.</p>
              </div>

              <textarea
                 rows={4}
                 value={responseMsg}
                 onChange={(e) => setResponseMsg(e.target.value)}
                 placeholder="Thank the customer or address their concerns..."
                 className="w-full rounded-2xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              />

              <div className="flex justify-end gap-3 text-sm">
                 <button onClick={() => setShowRespondModal(false)} className="px-6 py-2 text-gray-500 font-bold">Cancel</button>
                 <button
                   onClick={handleRespondSubmit}
                   disabled={!responseMsg}
                   className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition disabled:opacity-50"
                 >
                    Post Response
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Rate Customer overlay --------------------------------------- */}
      {showRateCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1">
              <SparklesIcon className="w-5 h-5 text-emerald-500" />
              Rate {rateData.customerName}
            </h3>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRateData({ ...rateData, rating: n })}
                  className={
                    n <= rateData.rating
                      ? "text-yellow-400 text-2xl"
                      : "text-gray-300 text-2xl"
                  }
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="How was your experience with this customer?"
              value={rateData.comment}
              onChange={(e) => setRateData({ ...rateData, comment: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex justify-end gap-3 text-sm">
              <button onClick={() => setShowRateCustomer(false)} className="text-gray-600 hover:underline">Cancel</button>
              <button onClick={handleRateCustomerSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-95">Submit Rating</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- edit modal ---------------- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-lg bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-emerald-700">Edit service</h3>

            <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Service name" className="input" />
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="input" />

            <select value={editForm.price_type} onChange={(e) => setEditForm({ ...editForm, price_type: e.target.value })} className="input">
              <option>Fixed</option>
              <option>Negotiable</option>
              <option>Visit Required</option>
            </select>

            {editForm.price_type === "Fixed" && (
              <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price (₦)" className="input" />
            )}

            <div className="flex justify-end gap-3 text-sm">
              <button onClick={() => setEditing(null)} className="px-4 py-1 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={saveEdits} className="cta-btn">Save</button>
            </div>
          </div>
        </div>
      )}
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
    case "in-progress":
      return "bg-purple-100 text-purple-800";
    case "declined":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "unpaid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/* ---------- tailwind shortcuts ---------- */
/* chip & badge share rounded‑full look */
const chip =
  "inline-block px-2 py-[2px] rounded-full whitespace-nowrap font-semibold";
const badge =
  "inline-block px-2 py-[2px] rounded-full whitespace-nowrap font-medium";