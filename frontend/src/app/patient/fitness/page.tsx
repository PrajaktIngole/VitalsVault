"use client";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";


function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (value / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
      >
        {value}%
      </text>
    </svg>
  );
}

export default function PatientFitnessPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [fitnessData, setFitnessData] = useState<any>(null);
  const [sugar, setSugar] = useState("");
  const [activityLevel, setActivityLevel] = useState("0");
  const [familyHistory, setFamilyHistory] = useState("0");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");

  const analyze = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first");

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

      const profileRes = await fetch(`${apiUrl}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) throw new Error("Could not fetch profile");
      const profileData = await profileRes.json();
      const patientId = profileData.profile?.id || profileData.patient?.id || profileData.id || profileData.patient_uid;

      if (!patientId) throw new Error("Could not determine patient ID");

      const response = await fetch(
        `${apiUrl}/api/fitness/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: patientId,
            height_cm: Number(height),
            weight_kg: Number(weight),
            age: Number(age),
            sugar: Number(sugar),
            systolic: Number(systolic),
            diastolic: Number(diastolic),
            activity_level: Number(activityLevel),
            family_history: Number(familyHistory),
          }),
        }
      );

      const data = await response.json();
      console.log("Analyze Response:", data);

      if (!response.ok) {
        alert(`Analysis failed: ${data.error || "Unknown error"}`);
        return;
      }

      // 🔥 IMPORTANT — set correctly
      setFitnessData({
        ...data.data,
        hypertension_risk: data.hypertensionRisk?.risk || "Unknown",
        risk_probability: data.hypertensionRisk?.probability || 0,
        diabetes_risk: data.diabetesRisk?.risk || "Unknown",
        diabetes_probability: data.diabetesRisk?.probability || 0,
      });

    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred during analysis.");
    }
  };



  return (
    <ProtectedRoute role="PATIENT">
      <Navbar />

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* LEFT PANEL */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 space-y-8">

            <div>
              <h1 className="text-2xl font-semibold">Health Analyzer</h1>
              <p className="text-sm opacity-90 mt-1">
                Professional-grade assessment of your metabolic vitals.
              </p>
            </div>

            {/* Personal Vitals */}
            <div>
              <h2 className="text-xs font-semibold uppercase opacity-80 mb-4">
                Personal Vitals
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <Input label="Height (cm)" onChange={setHeight} />
                <Input label="Weight (kg)" onChange={setWeight} />
                <Input label="Age" onChange={setAge} />
                <Input label="Glucose" onChange={setSugar} />
                <Input label="Systolic BP" onChange={setSystolic} />
                <Input label="Diastolic BP" onChange={setDiastolic} />

              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <h2 className="text-xs font-semibold uppercase opacity-80 mb-4">
                Lifestyle & History
              </h2>

              <select
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl outline-none text-white appearance-none cursor-pointer"
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="0" className="text-gray-900">Low Activity</option>
                <option value="1" className="text-gray-900">Medium Activity</option>
                <option value="2" className="text-gray-900">High Activity</option>
              </select>

              <select
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl outline-none text-white appearance-none cursor-pointer mt-4"
                onChange={(e) => setFamilyHistory(e.target.value)}
              >
                <option value="0" className="text-gray-900">No Family History</option>
                <option value="1" className="text-gray-900">Family History of Diabetes</option>
              </select>
            </div>

            <button
              onClick={analyze}
              className="w-full bg-white text-indigo-700 font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition"
            >
              Analyze My Health →
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="p-8 bg-gray-50">

            {fitnessData ? (
              <div className="space-y-8">

                {/* Overall Score */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Overall Health Score
                      </h3>
                      <p className="text-xs text-gray-500">Updated just now</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {fitnessData.health_score}%
                    </p>
                  </div>

                  <div className="w-full bg-gray-200 h-3 rounded-full mt-4">
                    <div
                      className="bg-orange-500 h-3 rounded-full"
                      style={{ width: `${fitnessData.health_score}%` }}
                    />
                  </div>

                  <p className="text-sm text-orange-600 mt-3">
                    Your score is moderate. Focus on glucose and BP management.
                  </p>
                </div>

                {/* Risk Cards */}
                <div className="grid grid-cols-2 gap-6">

                  <RiskCard
                    title="Hypertension"
                    risk={fitnessData.hypertension_risk}
                    value={fitnessData.risk_probability}
                    color="red"
                  />

                  <RiskCard
                    title="Diabetes"
                    risk={fitnessData.diabetes_risk}
                    value={fitnessData.diabetes_probability}
                    color="indigo"
                  />

                </div>

              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                Enter your details and analyze your health.
              </div>
            )}
          </div>
        </div>
      </div>

    </ProtectedRoute>
  );
}



function Input({ label, onChange }: any) {
  return (
    <div>
      <label className="text-xs opacity-80">{label}</label>
      <input
        type="number"
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl outline-none text-white placeholder-white/60"
      />
    </div>
  );
}

function RiskCard({ title, risk, value, color }: any) {
  const bg =
    color === "red"
      ? "bg-red-50"
      : "bg-indigo-50";

  const text =
    color === "red"
      ? "text-red-600"
      : "text-indigo-600";

  return (
    <div className={`${bg} p-6 rounded-2xl text-center shadow-md`}>
      <p className="font-semibold">{title}</p>
      <p className={`text-sm font-medium ${text} mt-1`}>
        ● {risk}
      </p>
      <div className="mt-4">
        <CircularProgress value={value || 0} color={color === "red" ? "#dc2626" : "#6366f1"} />
      </div>
    </div>
  );
}