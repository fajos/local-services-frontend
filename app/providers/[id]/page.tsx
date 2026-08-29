"use client";

import React, { useEffect, useState } from "react";
import API from "@/lib/api";
import Link from "next/link";
import {
  BuildingStorefrontIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";

interface ProviderProfile {
  id: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email?: string;
  open_hours?: string;
  average_rating?: number;
  reviews_count: number;
  image_url?: string;
  verified: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  provider_response?: string;
  customer_name: string;
  created_at: string;
}

export default function BusinessProfilePage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes, portRes, revRes] = await Promise.allSettled([
          API.get(`/providers/${params.id}`),
          API.get(`/services/provider/${params.id}`),
          API.get(`/providers/${params.id}/portfolio`),
          API.get(`/reviews/provider/${params.id}`)
        ]);

        if (pRes.status === "fulfilled") setProvider(pRes.value.data);
        if (sRes.status === "fulfilled") setServices(sRes.value.data);
        if (portRes.status === "fulfilled") setPortfolio(portRes.value.data);
        if (revRes.status === "fulfilled") setReviews(revRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold">Provider not found.</p>
      </div>
    );
  }

  const rating = provider.average_rating ? (provider.average_rating / 100).toFixed(1) : "5.0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-1">
             {provider.image_url ? (
               <img src={provider.image_url} alt={provider.business_name} className="w-full h-full object-cover rounded-2xl" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-indigo-600 rounded-2xl">
                 {provider.business_name[0]}
               </div>
             )}
          </div>
          <h1 className="text-4xl font-black tracking-tight">{provider.business_name}</h1>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
                <StarIcon className="w-3 h-3" /> {rating} ({provider.reviews_count} reviews)
             </div>
             {provider.verified && (
               <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Verified
               </div>
             )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-12 space-y-8 pb-20">
        {/* Stats Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 grid grid-cols-2 gap-4">
           <div className="text-center border-r border-gray-100">
              <p className="text-2xl font-black text-gray-900">{services.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Services</p>
           </div>
           <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{provider.reviews_count}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jobs Done</p>
           </div>
        </div>

        {/* About */}
        <div className="space-y-4">
           <h2 className="text-xl font-black text-gray-900">About Business</h2>
           <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-3xl border border-gray-100 italic">
              "We provide high quality service to our customers with professional experts."
           </p>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <EnvelopeIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Email Address</p>
                 <p className="font-bold text-gray-800">{provider.business_email || "N/A"}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                 <PhoneIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Phone Number</p>
                 <p className="font-bold text-gray-800">{provider.business_phone}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center">
                 <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Physical Address</p>
                 <p className="font-bold text-gray-800">{provider.business_address}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Opening Hours</p>
                 <p className="font-bold text-gray-800">{provider.open_hours || "Not specified"}</p>
              </div>
           </div>
        </div>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <div className="space-y-4">
             <h2 className="text-xl font-black text-gray-900">Work Portfolio</h2>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {portfolio.map((item) => (
                  <div key={item.id} className="min-w-[280px] h-48 rounded-3xl overflow-hidden relative group border-4 border-white shadow-lg flex-shrink-0">
                     <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <p className="text-white text-xs font-bold">{item.title}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-4">
           <h2 className="text-xl font-black text-gray-900">Available Services</h2>
           <div className="grid gap-4">
              {services.map((svc) => (
                <Link key={svc.id} href={`/services/${svc.id}`}>
                   <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-cyan-500 transition-colors group">
                      <div>
                         <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{svc.category}</p>
                         <h3 className="font-black text-gray-900 group-hover:text-cyan-700">{svc.name}</h3>
                         <p className="text-lg font-black text-gray-900 mt-1">₦{svc.price.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                         <ChevronRightIcon className="w-5 h-5" />
                      </div>
                   </div>
                </Link>
              ))}
           </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6 pt-10">
           <h2 className="text-xl font-black text-gray-900">Customer Feedback</h2>
           {reviews.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No reviews yet for this provider.</p>
           ) : (
              <div className="space-y-6">
                 {reviews.map(r => (
                    <article key={r.id} className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="font-black text-gray-900 text-lg">⭐ {r.rating}/5</p>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">From {r.customer_name}</p>
                          </div>
                          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                       </div>
                       <p className="text-gray-600 italic">"{r.comment || 'No comment provided.'}"</p>

                       {r.provider_response && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 border-l-4 border-l-cyan-600">
                             <p className="text-[10px] font-black text-cyan-600 uppercase mb-1">Provider's Reply:</p>
                             <p className="text-sm text-gray-700">{r.provider_response}</p>
                          </div>
                       )}
                    </article>
                 ))}
              </div>
           )}
        </div>

        <Link href="/" className="inline-block text-xs font-bold text-gray-400 hover:text-cyan-600 transition">
           ← BACK TO HOME
        </Link>
      </main>
    </div>
  );
}
