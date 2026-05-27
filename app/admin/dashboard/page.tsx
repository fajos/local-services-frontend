"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Summary {
  total_users: number;
  total_providers: number;
  unverified_providers: number;
  pending_payouts: number;
}

export default function AdminDashboardHome() {
  const [summary, setSummary] = useState<Summary | null>(null);
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

    axios.get("http://localhost:8000/admin/summary", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setSummary(res.data))
      .catch((err) => {
        console.error("Error fetching summary:", err);
        alert("Access denied or failed to fetch summary.");
      })
      .finally(() => setLoading(false));
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