// app/category/[category]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  price_type: string;
  price?: number;
  provider_verified: boolean;
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);

  const cat = decodeURIComponent(params.category);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/services/category/${cat}`)
      .then((res) => setServices(res.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <main className="min-h-screen bg-white text-gray-800 p-6">
      <h1 className="text-2xl font-bold text-pink-700 mb-6">
        {cat} Services
      </h1>

      {loading ? (
        <p>Loading…</p>
      ) : services.length === 0 ? (
        <p className="text-gray-600">
          No services in <strong>{cat}</strong> yet. Check back soon!
        </p>
      ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s) => (
                <Link key={s.id} href={`/services/${s.id}?auto=open-book`} className="block">
                  <div className="relative bg-white p-4 border rounded-2xl shadow
                    hover:shadow-lg hover:-translate-y-[2px] transition cursor-pointer">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-blue-700">{s.name}</h3>
                      {s.provider_verified && <VerifiedBadge className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {s.description}
                    </p>
                    <div className="mt-2 text-[11px] flex gap-2">
                      <span
                        className="absolute bottom-3 right-3 bg-gradient-to-r
                 from-emerald-500 to-fuchsia-600 text-white
                  px-4 py-1.5 rounded-full text-[11px] font-semibold
                  shadow-lg hover:brightness-110 transition pointer-events-none"
                      >
                        {s.price_type === "Fixed" ? "Book Now" : "Request Booking"}
                      </span>
                      {s.price_type === "Fixed" && (
                        <span className="bg-green-100 text-green-700 px-2 py-[2px] rounded-full">
                          ₦{s.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            
          ))}
        </div>
      )}
    </main>
  );
}