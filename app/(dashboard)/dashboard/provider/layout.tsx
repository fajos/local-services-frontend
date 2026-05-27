// app/(dashboard)/dashboard/layout.tsx

import { ReactNode } from "react";

export default function ProviderDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100">
      <div className="w-full max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800">
              📦 Provider Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Manage your services, view bookings, and interact with customers.
            </p>
          </header>

          <section className="space-y-16">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
