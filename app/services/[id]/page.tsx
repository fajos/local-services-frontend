"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "@/lib/api";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  TagIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  StarIcon,
  MapPinIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------*/
interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  price_type: "Fixed" | "Negotiable" | "Visit Required";
  price?: number;
  created_at: string;
  provider_id: string;
  provider: {
    id: string;
    business_name: string;
    business_address: string;
    open_hours?: string;
    average_rating?: number; // stored *100
    verified?: boolean;
    user: {
      first_name: string;
      last_name: string;
      is_identity_verified?: boolean;
    };
  };
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------*/
export default function ServiceDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  /* -------------------- state -------------------- */
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  /* -------------------- utils -------------------- */
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpen = searchParams?.get("auto") === "open-book";

  const cityInputRef = useRef<HTMLInputElement>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const isFixed = service?.price_type === "Fixed";
  const ctaText = isFixed ? "Book Now" : "Request Booking";

  /* -------------------- API actions -------------------- */
  async function handleBook() {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!city.trim()) {
      alert("Please enter your City / LGA first.");
      cityInputRef.current?.focus();
      return;
    }

    try {
      await API.post(
        "/bookings/",
        {
          service_id: service!.id,
          city_or_lga: city.trim(),
          note: note.trim() || null,
        }
      );
      router.push("/dashboard/customer");
    } catch (err) {
      console.error(err);
      alert("Failed to create booking. Try again.");
    }
  }

  /* -------------------- fetch on mount -------------------- */
  useEffect(() => {
    if (!params.id) return;

    API
      .get(`/services/${params.id}`)
      .then((res) => {
        setService(res.data);
        if (autoOpen) setTimeout(() => cityInputRef.current?.focus(), 120);
      })
      .catch((err) => {
        console.error("Failed to load service:", err);
        setService(null);
      })
      .finally(() => setLoading(false));
  }, [params.id, autoOpen]);

  /* ------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------*/
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-100 p-6">
        <div className="animate-pulse space-y-4 max-w-md w-full">
          <div className="h-8 bg-blue-100 rounded" />
          <div className="h-4 bg-blue-100 rounded" />
          <div className="h-32 bg-blue-100 rounded" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 text-red-500">Service not found.</div>
    );
  }

  const provider = service.provider;
  const rating = provider.average_rating
    ? (provider.average_rating / 100).toFixed(2)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 text-gray-800 p-6 pb-24">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-cyan-200 p-8 transform hover:-translate-y-[2px] hover:shadow-cyan-300 transition-all">
        {/* ------------ Service Info ------------- */}
        <header className="space-y-2 mb-6">
          <h1 className="text-4xl font-extrabold text-blue-800 flex items-center gap-2">
            <PencilSquareIcon className="w-7 h-7 text-fuchsia-600" />
            {service.name}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            {service.description}
          </p>
        </header>

        {/* ------------ Badges ------------------- */}
        <div className="flex flex-wrap gap-3 text-sm font-semibold mb-8">
          <span className="chip bg-blue-100 text-blue-800 flex items-center gap-1">
            <TagIcon className="w-4 h-4" /> {service.category}
          </span>
          <span className="chip bg-purple-100 text-purple-800 capitalize">
            {service.price_type}
          </span>
          {isFixed && service.price !== undefined && (
            <span className="chip bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CurrencyDollarIcon className="w-4 h-4" /> ₦{service.price}
            </span>
          )}
        </div>

        {/* ------------ Booking Form ------------- */}
        <section className="booking-form bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 p-6 rounded-xl shadow-inner space-y-4">
          <h2 className="text-lg font-bold text-blue-700 flex items-center gap-1">
            <MapPinIcon className="w-5 h-5" /> Book this service
          </h2>

          <input
            ref={cityInputRef}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Your City / LGA (e.g., Ikeja)"
            className="input"
          />

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional notes for provider (optional)"
            rows={3}
            className="input h-24 resize-none"
          />

          <button
            onClick={handleBook}
            className="cta-btn w-full md:w-auto"
          >
            {ctaText}
          </button>
        </section>

        {/* ------------ Provider Info ------------- */}
        <section className="mt-10 p-6 bg-gradient-to-r from-cyan-50 to-blue-100 rounded-xl border border-blue-200 shadow-inner space-y-3">
          <h3 className="text-lg font-bold text-blue-700 flex items-center gap-1">
            <BuildingStorefrontIcon className="w-5 h-5" /> Provider
          </h3>

          <div className="text-sm space-y-1">
            <p className="flex items-center gap-1">
              <strong>Name:</strong> {provider.user.first_name} {provider.user.last_name}
              {provider.user.is_identity_verified && <VerifiedBadge className="w-4 h-4 text-blue-500" />}
            </p>
            <p className="flex items-center gap-1">
              <strong>Business:</strong> {provider.business_name}
              {provider.verified && <VerifiedBadge className="w-4 h-4 text-emerald-500" title="Verified Business" />}
            </p>
          </div>

          {rating ? (
            <p className="flex items-center gap-1 text-sm">
              <StarIcon className="w-4 h-4 text-amber-500" />
              <strong>{rating}</strong> / 5
            </p>
          ) : (
            <p className="text-gray-500 text-xs italic">No ratings yet</p>
          )}

          {provider.id && (
            <Link
              href={`/providers/${provider.id}/reviews`}
              className="text-xs text-blue-600 hover:underline"
            >
              View Reviews
            </Link>
          )}
        </section>

        <div className="pt-6 text-sm">
          <Link href="/" className="text-cyan-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* ------------ Sticky Footer CTA ------------- */}
      <footer className="sticky-footer">
        <span className="text-xs text-gray-600 font-medium">
          {isFixed ? `₦${service.price} • Fixed price` : "Negotiable / Visit required"}
        </span>
        <button onClick={handleBook} className="cta-btn">
          {ctaText}
        </button>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Tailwind helper classes (via arbitrary values / @apply if you use it)
 * ------------------------------------------------------------------*/
const chip =
  "inline-flex items-center gap-1 px-3 py-[3px] rounded-full whitespace-nowrap" as const;
const input =
  "w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400" as const;
const ctaBtn =
  "bg-gradient-to-r from-emerald-500 to-fuchsia-600 text-white font-semibold px-8 py-2 rounded-full shadow-lg hover:brightness-110 active:scale-95 transition" as const;
const stickyFooter =
  "fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between" as const;

/* If you use @apply in your tailwind config, add:
   .chip       { @apply inline-flex items-center gap-1 px-3 py-[3px] rounded-full whitespace-nowrap; }
   .input      { @apply w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400; }
   .cta-btn    { @apply bg-gradient-to-r from-emerald-500 to-fuchsia-600 text-white font-semibold px-8 py-2 rounded-full shadow-lg hover:brightness-110 active:scale-95 transition; }
   .sticky-footer { @apply fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between; }
*/