"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, Zap, Lock } from "lucide-react";
import { getUserFromToken, type UserRole } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole | null>(null);
  const [open, setOpen] = useState(false);

  const [doctorProfileComplete, setDoctorProfileComplete] = useState(true);
  const [patientProfileComplete, setPatientProfileComplete] = useState(true);

  /* ================= AUTH + PROFILE CHECK ================= */
  useEffect(() => {
    const user = getUserFromToken();
    if (!user) return;

    setRole(user.role);
    const token = localStorage.getItem("token");
    if (!token) return;

    if (user.role === "DOCTOR") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        setDoctorProfileComplete(res.status !== 404);
      });
    }

    if (user.role === "PATIENT") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        setPatientProfileComplete(res.status !== 404);
      });
    }
  }, []);

  /* ================= LOCK LOGIC ================= */
  const isProfileLocked =
    (role === "DOCTOR" && !doctorProfileComplete) ||
    (role === "PATIENT" && !patientProfileComplete);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    router.replace("/");
  };

  /* ================= MENU CONFIG ================= */
  const doctorMenu = [
    { label: "Dashboard", href: "/doctor/dashboard", locked: true },
    { label: "Profile", href: "/doctor/profile/view", locked: false },
    { label: "Patients", href: "/doctor/patients", locked: true },
  ];

  const patientMenu = [
    { label: "Dashboard", href: "/patient/dashboard", locked: true },
    { label: "Profile", href: "/patient/profile/view", locked: false },
    { label: "Notes", href: "/patient/notes", locked: true },
    { label: "Prescriptions", href: "/patient/prescriptions", locked: true },
    { label: "Fitness", href: "/patient/fitness", locked: true },
  ];

  const menu =
    role === "DOCTOR"
      ? doctorMenu
      : role === "PATIENT"
      ? patientMenu
      : [];

  /* ================= LINK RENDER ================= */
  const renderLink = (item: any) => {
    const locked = isProfileLocked && item.locked;

    const base =
      "text-sm font-medium transition-colors flex items-center gap-1";

    if (locked) {
      return (
        <span
          key={item.label}
          className={`${base} text-gray-400 cursor-not-allowed`}
          title="Complete your profile to unlock"
        >
          <Lock className="w-3 h-3" />
          {item.label}
        </span>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={`${base} ${
          pathname === item.href
            ? "text-indigo-600"
            : "text-gray-600 hover:text-indigo-600"
        }`}
      >
        {item.label}
      </Link>
    );
  };

  /* ================= UI ================= */
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* 🔒 BLOCK LOGO NAVIGATION IF LOCKED */}
            {isProfileLocked ? (
              <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
                <Zap className="w-5 h-5" />
                <span className="text-xl font-bold">Vitals Vault</span>
              </span>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-indigo-900">
                  Vitals Vault
                </span>
              </Link>
            )}
          </div>

          {/* CENTER */}
          <div className="hidden md:flex items-center gap-8">
            {menu.map(renderLink)}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {role && (
              <span className="hidden xs:inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">
                {role}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-semibold"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-gray-50">
          <div className="space-y-2 px-4 py-3">
            {menu.map(renderLink)}

            {isProfileLocked && (
              <p className="text-xs text-red-500 mt-2">
                🔒 Complete your profile to unlock all features
              </p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
