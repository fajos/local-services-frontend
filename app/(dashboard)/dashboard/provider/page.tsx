/* -------------------- pages/(dashboard)/provider/DashboardPage.tsx -------------------- */
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  SparklesIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
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
}

/* ---------- component ---------- */
export default function DashboardPage() {
  /* state & hooks ---------------------------------------------------- */
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  const [flash, setFlash] = useState<string | null>(null);

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
      .catch(() => router.push("/"));

    API.get("/services/me")
      .then((res) => setServices(res.data));

    API.get("/bookings/provider/me")
      .then((res) => setBookings(res.data));
  }, [token, user]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  /* if awaiting approval -------------------------------------------- */
  if (user && (!user.is_provider || !user.is_verified_provider)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-rose-100 px-4">
          <div className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-amber-100">
            <h1 className="text-3xl font-extrabold text-amber-600 flex items-center justify-center gap-2">
              <SparklesIcon className="w-8 h-8 text-amber-500" />
              Awaiting Approval
            </h1>
            <p className="mt-4 text-sm max-w-md text-gray-600">
              Your provider profile is currently under review by our admin team.
              Once approved, you'll receive an email notification and gain full access to manage your business.
            </p>
            <div className="mt-8">
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow-md transition disabled:opacity-50"
              >
                {checking ? "Checking..." : "Refresh Status"}
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
        {/* services section */}
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

                      {b.payment_status.toLowerCase() === "paid" &&
                        b.booking_status.toLowerCase() !== "completed" && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            className="w-full sm:w-auto px-6 py-2 bg-violet-600 text-white rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            Mark as Completed
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
      </div>
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