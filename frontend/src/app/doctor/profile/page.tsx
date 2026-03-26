"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Suspense } from "react";

function DoctorProfileForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isEdit = mode === "edit";

  const router = useRouter();

  const [form, setForm] = useState({
    education: "",
    specialization: "",
    experience_years: "",
    hospital_name: "",
    registration_number: "",
    online_fee: "",
    clinic_fee: "",
  });

  // =====================
  // INPUT CHANGE
  // =====================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =====================
  // SUBMIT (CREATE / EDIT)
  // =====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 🔴 VERY IMPORTANT
    console.log("SUBMIT WORKING");

    const token = localStorage.getItem("token");

    const url = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`;
    const method = isEdit ? "PUT" : "POST";


    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        experience_years: Number(form.experience_years),
      }),
    });

    if (res.ok) {
      alert("Profile updated successfully");
      router.push("/doctor/profile/view");
    } else {
      alert("Something went wrong");
    }
  };

  // =====================
  // PREFILL IN EDIT MODE
  // =====================
  useEffect(() => {
    if (!isEdit) return;

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("PREFILL DATA:", data);

        setForm({
          education: data.education ?? "",
          specialization: data.specialization ?? "",
          experience_years: data.experience_years
            ? data.experience_years.toString()
            : "",
          hospital_name: data.hospital_name ?? "",
          registration_number: data.registration_number ?? "",
          online_fee: data.online_fee ? data.online_fee.toString() : "",
          clinic_fee: data.clinic_fee ? data.clinic_fee.toString() : "",
        });
      });
  }, [isEdit]);


  // =====================
  // BLOCK CREATE IF EXISTS
  // =====================
  useEffect(() => {
    if (isEdit) return;

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 200) {
        router.replace("/doctor/profile/view");
      }
    });
  }, [isEdit, router]);

  return (
    <ProtectedRoute role="DOCTOR">
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="flex justify-center p-6">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isEdit ? "Edit Doctor Profile" : "Complete Doctor Profile"}
            </h2>

            <p className="text-gray-600 mb-6">
              Please provide your professional details
            </p>

            {/* 🔴 FORM START */}
            <form onSubmit={handleSubmit}>
              {/* Registration */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Registration Number
              </label>
              <input
                type="text"
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 mb-4"
              />

              {/* Fees */}
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <input
                  type="number"
                  name="online_fee"
                  value={form.online_fee}
                  onChange={handleChange}
                  placeholder="Online Fee"
                  className="w-full border rounded-lg px-4 py-2"
                />
                <input
                  type="number"
                  name="clinic_fee"
                  value={form.clinic_fee}
                  onChange={handleChange}
                  placeholder="Clinic Fee"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              {/* Education */}
              <input
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="Education"
                className="w-full border p-3 rounded-lg mb-4"
              />

              {/* Specialization */}
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Specialization"
                className="w-full border p-3 rounded-lg mb-4"
              />

              {/* Experience */}
              <input
                type="number"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                placeholder="Experience (years)"
                className="w-full border p-3 rounded-lg mb-4"
              />

              {/* Hospital */}
              <input
                name="hospital_name"
                value={form.hospital_name}
                onChange={handleChange}
                placeholder="Hospital / Clinic"
                className="w-full border p-3 rounded-lg mb-6"
              />

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold"
              >
                {isEdit ? "Update Profile" : "Save Profile & Continue"}
              </button>
            </form>
            {/* 🔴 FORM END */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorProfileForm />
    </Suspense>
  );
}


// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function DoctorProfileRedirect() {
//   const router = useRouter();

//   useEffect(() => {
//     router.replace("/doctor/profile/view");
//   }, [router]);

//   return null;
// }
