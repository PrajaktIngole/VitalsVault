"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";

import { Suspense } from "react";

function ProtectedRouteInner({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "DOCTOR" | "PATIENT";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);

  const isEdit = searchParams.get("mode") === "edit";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getUserFromToken();
    if (!user) {
      router.replace("/login");
      return;
    }

    // Role check
    if (role && user.role !== role) {
      router.replace("/unauthorized");
      return;
    }

    // ============================
    // DOCTOR PROFILE LOGIC
    // ============================
    if (user.role === "DOCTOR") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          const isProfilePage = pathname === "/doctor/profile";

          // 🟢 ALLOW EDIT MODE ALWAYS
          if (isProfilePage && isEdit) {
            setLoading(false);
            return;
          }

          // ❌ Profile NOT created → force create page
          if (res.status === 404 && !isProfilePage) {
            router.replace("/doctor/profile");
            return;
          }

          // ❌ Profile already exists → block create page
          if (res.status === 200 && isProfilePage && !isEdit) {
            router.replace("/doctor/dashboard");
            return;
          }

          setLoading(false);
        })
        .catch(() => {
          router.replace("/login");
        });

      return;
    }

    // ============================
    // PATIENT FLOW
    // ============================
    setLoading(false);
  }, [router, role, pathname, isEdit]);

  if (loading) {
    return <div className="p-6 text-gray-600">Checking access...</div>;
  }

  return <>{children}</>;
}

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "DOCTOR" | "PATIENT";
}) {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <ProtectedRouteInner role={role}>{children}</ProtectedRouteInner>
    </Suspense>
  );
}
