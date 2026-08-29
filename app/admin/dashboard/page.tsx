"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Summary {
  total_users: number;
  total_providers: number;
  unverified_providers: number;
  pending_payouts: number;
  total_disputes: number;
}

interface CategoryAnalytic {
  category: string;
  booking_count: number;
  total_revenue: number;
}

export default function AdminDashboardHome() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<CategoryAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
    if (!payload?.is_admin) {
      router.push("/");
      return;
    }

    Promise.all([
      API.get("/admin/summary"),
      API.get("/admin/analytics/categories")
    ]).then(([sumRes, anaRes]) => {
      setSummary(sumRes.data);
      setAnalytics(anaRes.data);
    }).catch((err) => {
      console.error("Error fetching admin data:", err);
      alert("Access denied or failed to fetch summary.");
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="flex justify-center mt-20 text-gray-800">Loading summary...</div>;
  }

  if (!summary) {
    return <p className="text-red-500 text-center mt-10">Failed to load summary data.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 text-gray-800 p-6">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-8">🛡 Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Users"
          count={summary.total_users}
          icon="👤"
          color="from-blue-500 to-blue-700"
          href="/admin/users"
        />
        <DashboardCard
          title="Providers"
          count={summary.total_providers}
          subtitle={`${summary.unverified_providers} unverified`}
          icon="🧰"
          color="from-purple-500 to-purple-700"
          href="/admin/providers"
        />
        <DashboardCard
          title="Pending Payouts"
          count={summary.pending_payouts}
          icon="💵"
          color="from-green-500 to-green-700"
          href="/admin/bookings/paid"
        />
        <DashboardCard
          title="Open Disputes"
          count={summary.total_disputes}
          icon="⚠️"
          color="from-red-500 to-red-700"
          href="/admin/disputes"
        />
      </div>

      <h2 className="text-2xl font-bold text-blue-700 mt-12 mb-6">📈 Category Analytics</h2>
      <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-sm overflow-hidden">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.map(item => (
               <div key={item.category} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                     <p className="font-bold text-gray-900">{item.category}</p>
                     <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase">
                        {item.booking_count} Bookings
                     </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">₦{item.total_revenue.toLocaleString()}</p>
                  <div className="w-full bg-blue-100 h-1.5 rounded-full mt-4 overflow-hidden">
                     <div
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${Math.min(100, (item.booking_count / (summary.total_users || 1)) * 100)}%` }}
                     />
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  count,
  icon,
  subtitle,
  color,
  href
}: {
  title: string;
  count: number;
  icon: string;
  subtitle?: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-3xl font-extrabold mt-2">{count}</p>
            {subtitle && <p className="text-sm mt-1 text-blue-100">{subtitle}</p>}
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  );
}