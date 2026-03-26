"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromToken();

    if (user) {
      if (user.role === "DOCTOR") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/patient/dashboard");
      }
    }
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
    {/* HERO */}
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
      <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
        New • AI-Powered Clinical Notes
      </span>

      <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
        Your Health History,
        <span className="text-blue-600"> Securely Vaulted.</span>
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
        VitalsVault bridges the gap between patient care and clinical data.
        Track vitals in real-time, manage secure records, and empower better
        decisions for doctors and patients.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold"
        >
          Register
        </Link>
      </div>

      <div className="mt-10 flex justify-center gap-6 text-sm text-gray-500">
        <span>🔐 HIPAA Compliant</span>
        <span>🔒 End-to-End Encrypted</span>
      </div>
    </section>

    {/* FEATURES */}
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">
        Complete Care Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Feature
          title="Doctor Dashboard"
          desc="View patient history, live vitals, and manage prescriptions with ease."
          icon="🩺"
        />
        <Feature
          title="Patient Portal"
          desc="Upload reports, track vitals, and communicate securely with doctors."
          icon="👤"
        />
        <Feature
          title="Bank-Grade Security"
          desc="Encrypted data at rest and in transit. Fully compliant with healthcare standards."
          icon="🔐"
        />
        <Feature
          title="Digital Records"
          desc="No more paperwork. Prescriptions, labs, and notes—all in one vault."
          icon="📄"
        />
      </div>
    </section>

    {/* FOOTER */}
    <footer className="text-center py-8 text-sm text-gray-500">
      © {new Date().getFullYear()} VitalsVault. All rights reserved.
    </footer>
  </div>
);


function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

}
