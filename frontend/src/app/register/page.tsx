"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    setSuccess("Registration successful! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Register for <span className="font-semibold">Vitals Vault</span>
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        {success && (
          <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {success}
          </p>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Full Name
        </label>
        <input
          className="w-full border border-gray-400 focus:border-blue-600 focus:outline-none p-3 rounded-lg mb-4 text-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          className="w-full border border-gray-400 focus:border-blue-600 focus:outline-none p-3 rounded-lg mb-4 text-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Register As
        </label>
        <select
          className="w-full border border-gray-400 focus:border-blue-600 focus:outline-none p-3 rounded-lg mb-6 text-gray-800"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
