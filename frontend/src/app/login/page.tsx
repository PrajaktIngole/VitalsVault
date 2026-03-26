"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  /* 🔐 BLOCK LOGIN PAGE IF ALREADY LOGGED IN */
  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      if (user.role === "DOCTOR") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/patient/dashboard");
      }
    }
  }, [router]);

  const handleLogin = async () => {
    setError("");

    /* 1️⃣ LOGIN */
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    /* 2️⃣ SAVE TOKEN */
    const token = data.token;
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/`;

    /* 3️⃣ GET ROLE FROM TOKEN */
    const user = getUserFromToken();

    /* ================= DOCTOR FLOW ================= */
    if (user?.role === "DOCTOR") {
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (profileRes.status === 404) {
        // ❌ Doctor profile NOT created
        router.replace("/doctor/profile");
      } else {
        // ✅ Doctor profile exists
        router.replace("/doctor/dashboard");
      }
      return;
    }

    /* ================= PATIENT FLOW ================= */
    
    if (user?.role === "PATIENT") {
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (profileRes.status === 404) {
        // ❌ Patient profile NOT created
        router.replace("/patient/profile");
      } else {
        // ✅ Patient profile exists
        router.replace("/patient/dashboard");
      }
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Login to <span className="font-semibold">Vitals Vault</span>
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          className="w-full border border-gray-400 focus:border-blue-600 focus:outline-none p-3 rounded-lg mb-4 text-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          className="w-full border border-gray-400 focus:border-blue-600 focus:outline-none p-3 rounded-lg mb-6 text-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
