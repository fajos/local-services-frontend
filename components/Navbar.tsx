"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VerifiedBadge from "./VerifiedBadge";
import NotificationDropdown from "./NotificationDropdown";
import API from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  HomeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, token, logout, viewMode, setViewMode } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
    setIsOpen(false);
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await API.post("/auth/resend-email", { email: user.email });
      toast.success("Verification email resent!");
    } catch (err) {
      toast.error("Failed to resend email.");
    } finally {
      setResending(false);
    }
  };

  const isAdmin = user?.is_admin === true;
  const isSuperAdmin = user?.is_super_admin === true;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {user && !user.is_email_confirmed && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-center text-[10px] md:text-xs font-medium border-b border-amber-200">
          Verify your email to access all features.
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="ml-2 underline hover:text-amber-900 disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend link"}
          </button>
        </div>
      )}
      <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" onClick={closeMenu} className="text-lg font-bold text-cyan-400 shrink-0">
              Local Service Finder
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="hover:text-cyan-400 font-medium text-sm transition">Home</Link>

              {!user && (
                <>
                  <Link href="/login" className="hover:text-cyan-400 font-medium text-sm transition">Login</Link>
                  <Link href="/register" className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg font-medium text-sm transition">Register</Link>
                </>
              )}

              {user && (
                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="hover:text-cyan-400 font-medium text-sm">Admin</Link>
                  )}

                  {!isAdmin && user.is_provider && user.is_verified_provider && (
                    <div className="flex items-center bg-gray-800 rounded-full p-1 border border-gray-700">
                      <button
                        onClick={() => { setViewMode("customer"); router.push("/dashboard/customer"); }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${viewMode === 'customer' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}
                      >
                        Customer
                      </button>
                      <button
                        onClick={() => { setViewMode("provider"); router.push("/dashboard/provider"); }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${viewMode === 'provider' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
                      >
                        Provider
                      </button>
                    </div>
                  )}

                  <NotificationDropdown />

                  <Link href="/profile" className="flex items-center gap-2 hover:text-cyan-400 transition">
                    <div className="text-right">
                      <div className="text-xs font-bold leading-none flex items-center gap-1">
                        {user.first_name} {user.is_identity_verified && <VerifiedBadge className="w-3 h-3 text-blue-400" />}
                      </div>
                      {isSuperAdmin && <div className="text-[8px] text-yellow-400 uppercase font-black tracking-tighter">Super Admin</div>}
                    </div>
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={toggleMenu}
                title={isOpen ? "Close menu" : "Open menu"}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition"
              >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800 animate-fade-in-down">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-cyan-400">
                <HomeIcon className="w-5 h-5" /> Home
              </Link>

              {user ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin/dashboard" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-cyan-400">
                      <ShieldCheckIcon className="w-5 h-5" /> Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      {user.is_provider && (
                        <>
                          <Link href="/dashboard/customer" onClick={() => { setViewMode("customer"); closeMenu(); }} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${viewMode === 'customer' ? 'bg-cyan-900/30 text-cyan-400' : 'text-gray-300'}`}>
                            <Squares2X2Icon className="w-5 h-5" /> Customer Dashboard
                          </Link>
                          <Link href="/dashboard/provider" onClick={() => { setViewMode("provider"); closeMenu(); }} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${viewMode === 'provider' ? 'bg-orange-900/30 text-orange-400' : 'text-gray-300'}`}>
                            <BriefcaseIcon className="w-5 h-5" /> Provider Dashboard
                          </Link>
                        </>
                      )}
                      {!user.is_provider && (
                        <Link href="/provider/setup" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-orange-400 hover:bg-orange-900/20">
                          <BriefcaseIcon className="w-5 h-5" /> Become a Provider
                        </Link>
                      )}
                    </>
                  )}

                  <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-cyan-400">
                    <UserCircleIcon className="w-5 h-5" /> Profile Settings
                  </Link>

                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <div className="px-3 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-cyan-400 font-bold">
                          {user.first_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-1">
                            {user.first_name} {user.is_identity_verified && <VerifiedBadge className="w-3 h-3 text-blue-400" />}
                          </div>
                          <div className="text-[10px] text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        aria-label="Logout"
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
                      >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link href="/login" onClick={closeMenu} className="flex items-center justify-center py-3 rounded-xl border border-gray-700 text-sm font-bold text-gray-300 hover:bg-gray-800">
                    Login
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="flex items-center justify-center py-3 rounded-xl bg-cyan-600 text-sm font-bold text-white hover:bg-cyan-700">
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
