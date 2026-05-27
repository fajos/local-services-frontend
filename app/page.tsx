// HomePage.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; 
import { CATEGORIES } from "@/utils/categories";

export default function HomePage() {
  const { user } = useAuth(); 

  const isLoggedIn     = !!user;
  const isProvider     = user?.is_provider === true;


  return (
    <main className="bg-white text-gray-800 text-[0.92rem] leading-relaxed">
      {/* Hero Section */}
      <section className="relative px-6 py-28 md:py-48 text-white overflow-hidden">
        {/* Background Image with refined Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1920')",
          }}
        ></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-900/90 via-black/40 to-pink-900/40"></div>

        {/* Content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold uppercase tracking-widest text-pink-300 mb-2 md:mb-4 animate-pulse">
            ✨ Your #1 Local Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[1.1] drop-shadow-2xl">
            Find the Perfect <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
              Pro for Any Task
            </span>
          </h1>

          <p className="text-base md:text-2xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            Reliable experts for your home, office, and personal needs.
            <span className="hidden sm:inline"> Verified, reviewed, and ready to help.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5 pt-4">
            {!isLoggedIn && (
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-base md:text-lg px-10 py-4 rounded-2xl shadow-2xl transition-all hover:-translate-y-1 hover:shadow-pink-500/40 active:scale-95">
                  Get Started Free
                </button>
              </Link>
            )}

            {isLoggedIn && !isProvider && (
              <Link href="/provider/setup" className="w-full sm:w-auto">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white text-base md:text-lg px-10 py-4 rounded-2xl font-black backdrop-blur-md border border-white/30 shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
                  Start Selling
                </button>
              </Link>
            )}

            <button className="w-full sm:w-auto bg-white text-blue-900 hover:bg-gray-100 text-base md:text-lg px-10 py-4 rounded-2xl font-black shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
              Explore Services
            </button>
          </div>

          {/* Quick stats / Trust badges */}
          <div className="pt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
            <div className="text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Verified Pros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12k+</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-pink-700">
          Explore Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {CATEGORIES.slice(0, 12).map((cat, i) => (
            
            <div
              key={cat}
              className={`rounded-xl shadow p-4 text-center font-semibold text-sm text-white transition-transform hover:-translate-y-1 ${[
                "bg-gradient-to-tr from-teal-400 to-blue-500",
                "bg-gradient-to-tr from-pink-400 to-red-500",
                "bg-gradient-to-tr from-yellow-400 to-orange-500",
                "bg-gradient-to-tr from-green-400 to-emerald-500",
                "bg-gradient-to-tr from-purple-400 to-fuchsia-500",
                "bg-gradient-to-tr from-indigo-400 to-blue-600",
                "bg-gradient-to-tr from-rose-400 to-pink-500",
                "bg-gradient-to-tr from-cyan-400 to-sky-500",
              ][i % 8]}`}
            >
              <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}>
            <div className="rounded-xl shadow … hover:-translate-y-1 transition">
              {cat}
            </div>
          </Link>
            </div>
            
          ))}
        </div>
      </section>

      {/* Why Trust Us Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-indigo-900 mb-10">
          Why Trust Local Service Finder?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto">
          {[
            {
              title: "Verified Professionals",
              desc: "Every provider undergoes a manual review process by our admin team to ensure platform integrity.",
              icon: "🛡️"
            },
            {
              title: "Transparent Pricing",
              desc: "Choose from fixed, negotiable, or visit-based pricing models that suit your specific needs.",
              icon: "💰"
            },
            {
              title: "Authentic Trust Signals",
              desc: "The 'Blue Tick' badge is strictly reserved for providers with verified phone numbers and approved profiles.",
              icon: "✅"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact Us</h4>
              <p className="text-gray-600 text-sm font-medium">Have questions? We're here to help.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
              <a href="tel:+2348068319016" className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition">
                <span className="text-lg">📞</span> +234 806 831 9016
              </a>
              <a
                href="mailto:orjidom@yahoo.com?subject=Inquiry - Local Service Finder"
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
              >
                <span className="text-lg">✉️</span> orjidom@yahoo.com
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-gray-500 text-[10px] uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Local Service Finder — Designed with 💙 for everyday people.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}