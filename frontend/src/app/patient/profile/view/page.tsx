"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import router from "next/dist/shared/lib/router/router";
import { useRouter } from "next/navigation";


type PatientProfile = {
  patient_uid: string;
  name: string;
  age: number;
  gender: string;
  blood_group?: string;
  smoking?: boolean;
  alcohol?: string;
  diet_preference?: string;
  physical_activity?: string;
  chronic_diseases: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  bmi_category?: string;
};

export default function PatientProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // ✅ BMI states
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 404) {
        router.replace("/patient/profile");
      }
    });
  }, [router]);



  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.profile) {
          // profile not created → redirect (extra safety)
          router.replace("/patient/profile");
          return;
        }

        setProfile(data.profile);
        setHeight(data.profile.height_cm ?? "");
        setWeight(data.profile.weight_kg ?? "");
        setLoading(false);
      });


  }, []);

  const saveBMI = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/bmi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height_cm: height,
          weight_kg: weight,
        }),
      });

      // 🔁 Reload profile to get updated BMI
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error("Failed to save BMI", err);
    } finally {
      setSaving(false);
    }
  };

  const getBMIBadgeStyle = (category?: string) => {
    switch (category) {
      case "Underweight":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Normal":
        return "bg-green-100 text-green-700 border-green-300";
      case "Overweight":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Obese":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };





  return (
    <ProtectedRoute role="PATIENT">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              My Health Profile
            </h2>

            <p>
              Welcome Back, {profile ? profile.name : "Patient"}!
            </p>



            <p className="text-gray-500">
              Manage your personal health information
            </p>
          </div>

          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
            ✅ Verified Patient Account
          </span>

          <button
            onClick={() => router.push("/patient/profile/edit")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-800 text-white font-semibold hover:bg-gray-900 transition"
          >
            ✏️ Edit Profile
          </button>

        </div>

        {loading && <p className="text-gray-700">Loading profile...</p>}

        {!loading && profile && (
          <div className="space-y-6">
            {/* ================= PATIENT IDENTITY ================= */}
            <div className="bg-white rounded-xl shadow ">
              <div className="px-6 py-4 border-b">
                <h3 className="text-sm font-semibold text-gray-500 tracking-wide">
                  PATIENT IDENTITY
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Patient ID */}
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="text-lg font-bold text-gray-900 tracking-wide">
                    {profile.patient_uid}
                  </p>

                </div>

                {/* Age */}
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.age} Years
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= BMI ================= */}
            {/* ================= BMI CALCULATOR ================= */}
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  📈
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    BMI Calculator
                  </h4>
                  <p className="text-sm text-gray-500">
                    Body Mass Index Estimation
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      📏
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ⚖️
                    </span>
                  </div>
                </div>
              </div>

              {/* Result Box */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Your BMI
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {profile.bmi ?? "—"}
                    </p>
                  </div>

                  {profile.bmi_category && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getBMIBadgeStyle(
                        profile.bmi_category
                      )}`}
                    >
                      {profile.bmi_category}
                    </span>
                  )}
                </div>

                <button
                  onClick={saveBMI}
                  disabled={saving}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black transition"
                >
                  {saving ? "Updating..." : "Update Metrics"}
                </button>
              </div>
            </div>



            {/* ================= INFO CARDS ================= */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chronic Diseases */}
              <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-400">
                <h4 className="font-semibold text-gray-900 mb-2">
                  ❤️ Chronic Diseases
                </h4>
                <p className="text-gray-700">
                  {profile.chronic_diseases || "None"}
                </p>
              </div>

              {/* Blood Group */}
              <div className="bg-white rounded-xl shadow p-6 border-t-4 border-pink-500">
                <h4 className="font-semibold text-gray-900 mb-2">
                  🩸 Blood Group
                </h4>
                <p className="text-xl font-bold text-red-600">
                  {profile.blood_group || "—"}
                </p>
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-xl shadow p-6 border-t-4 border-yellow-400">
                <h4 className="font-semibold text-gray-900 mb-2">
                  ⚠️ Allergies
                </h4>
                <p className="text-gray-700">
                  {profile.allergies || "None"}
                </p>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-400">
                <h4 className="font-semibold text-gray-900 mb-2">
                  🕒 Medical History
                </h4>
                <p className="text-gray-700">
                  {profile.medical_history || "None"}
                </p>
              </div>



            </div>
            {/* Current Medications */}
            <div className="bg-white  rounded-xl shadow p-6 border-t-4 border-indigo-400">
              <h4 className="font-semibold text-gray-900 mb-2">
                💊 Current Medications
              </h4>
              <p className="text-gray-700">
                {profile.current_medications || "None"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                🏃 Lifestyle Factors
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-center">
                  🚬 Smoking: {profile.smoking ? "Yes" : "No"}
                </span>

                <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-center">
                  🍺 Alcohol: {profile.alcohol || "—"}
                </span>

                <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-center">
                  🥗 Diet: {profile.diet_preference || "—"}
                </span>

                <span className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-center">
                  🏋️ Activity: {profile.physical_activity || "—"}
                </span>
              </div>
            </div>



          </div>
        )}
      </div>





    </ProtectedRoute>
  );
}
