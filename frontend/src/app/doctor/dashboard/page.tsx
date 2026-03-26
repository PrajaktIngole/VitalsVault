"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { profile } from "console";

export default function DoctorDashboard() {
  const [doctorName, setDoctorName] = useState("Doctor");
  const [patients, setPatients] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [patientMap, setPatientMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, vitalsRes, patientsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/vitals/doctor`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients`, { headers }),
        ]);

        const profileData = await profileRes.json();
        const vitalsData = await vitalsRes.json();
        const patientsData = await patientsRes.json();

        if (profileData?.name) setDoctorName(profileData.name);

        const finalVitals = Array.isArray(vitalsData) ? vitalsData : (vitalsData.vitals || []);
        const finalPatients = Array.isArray(patientsData) ? patientsData : (patientsData.patients || []);

        setVitals(finalVitals);
        setPatients(finalPatients);

        const map: Record<number, string> = {};
        finalPatients.forEach((p: any) => {
          map[Number(p.patient_id)] = p.name;
        });
        setPatientMap(map);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const criticalPatients = useMemo(() => {
    const today = new Date().toDateString();
    const map = new Map<number, any>();

    vitals.forEach((v) => {
      const pId = Number(v.patient_id || v.id);
      const dateStr = v.recorded_at || v.recorded_date;
      if (!dateStr) return;
      if (new Date(dateStr).toDateString() !== today) return;

      const isCritical =
        Number(v.systolic) >= 140 ||
        Number(v.diastolic) >= 90 ||
        Number(v.spo2) <= 92 ||
        Number(v.heart_rate) >= 110 ||
        Number(v.sugar_mg) >= 200;

      if (!isCritical) return;

      const prev = map.get(pId);
      if (!prev || new Date(dateStr) > new Date(prev.recorded_at || prev.recorded_date)) {
        map.set(pId, v);
      }
    });

    return Array.from(map.values());
  }, [vitals, patients]);

  const vitalsTodayCount = useMemo(() => {
    const today = new Date().toDateString();
    return vitals.filter((v: any) => {
      const d = v.recorded_at || v.recorded_date;
      return d && new Date(d).toDateString() === today;
    }).length;
  }, [vitals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute role="DOCTOR">
      <Navbar />
      <div className="bg-gray-50/30 min-h-screen pb-16">
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-6">

    {/* ===== HEADER ===== */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        <h1 className="text-xl sm:text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
          Doctor Dashboard
        </h1>

        <div className="hidden md:block h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">

          <div className="bg-blue-100/80 text-blue-600 font-bold w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white">
            {doctorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "DR"}
          </div>

          <span className="font-bold text-slate-800 text-base sm:text-lg">
            Dr. {doctorName}
          </span>

        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-gray-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        LIVE MONITORING
      </div>

    </div>



    {/* ===== STAT CARDS ===== */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">

      {/* Assigned Patients */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md">

        <div>
          <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-8 0" />
            </svg>
          </div>

          <p className="text-[10px] sm:text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2">
            Assigned Patients
          </p>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            +2 since yesterday
          </div>
        </div>

        <span className="text-3xl sm:text-4xl md:text-[48px] font-black text-slate-900">
          {patients.length}
        </span>

      </div>



      {/* Entries Today */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md">

        <div>
          <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h4l2-5 4 10 2-5h4" />
            </svg>
          </div>

          <p className="text-[10px] sm:text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2">
            Entries Today
          </p>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active monitoring
          </div>
        </div>

        <span className="text-3xl sm:text-4xl md:text-[48px] font-black text-slate-900">
          {vitalsTodayCount}
        </span>

      </div>



      {/* Active Alerts */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md">

        <div>
          <div className="bg-red-100 text-red-500 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>

          <p className="text-[10px] sm:text-[11px] font-black text-gray-400 tracking-widest uppercase mb-2">
            Active Alerts
          </p>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Needs attention
          </div>
        </div>

        <span className="text-3xl sm:text-4xl md:text-[48px] font-black text-slate-900">
          {criticalPatients.length}
        </span>

      </div>

    </div>



    {/* ===== CRITICAL ALERTS ===== */}

    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

      <h2 className="text-[12px] sm:text-[13px] font-black tracking-widest text-slate-400 uppercase">
        🚨 Active Critical Alerts
      </h2>

      {criticalPatients.length > 0 && (
        <span className="text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full bg-red-50 text-red-500">
          {criticalPatients.length} CRITICAL
        </span>
      )}

    </div>



    {/* ===== TABLE ===== */}

    {criticalPatients.length > 0 ? (

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm min-w-[650px]">

            <thead className="bg-red-50 text-red-500 text-[10px] sm:text-[11px] font-black uppercase text-left border-b border-red-100">

              <tr>
                <th className="py-3 px-4 sm:px-6">Patient</th>
                <th className="py-3 px-4 sm:px-6">Blood Pressure</th>
                <th className="py-3 px-4 sm:px-6">Heart Rate</th>
                <th className="py-3 px-4 sm:px-6">SpO₂</th>
                <th className="py-3 px-4 sm:px-6">Sugar</th>
              </tr>

            </thead>

            <tbody>

              {criticalPatients.map((v, i) => {

                const pId = Number(v.patient_id || v.id);
                const patientName = patientMap[pId] || `Patient #${pId}`;

                const bpCritical =
                  Number(v.systolic) >= 140 || Number(v.diastolic) >= 90;

                const hrCritical = Number(v.heart_rate) >= 110;

                const spo2Critical = Number(v.spo2) <= 92;

                const sugarCritical = Number(v.sugar_mg) >= 200;

                return (

                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">

                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-800">
                      {patientName}
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`font-bold ${
                          bpCritical ? "text-red-500" : "text-slate-700"
                        }`}
                      >
                        {v.systolic}/{v.diastolic}
                      </span>
                      <div className="text-[11px] text-gray-400">mmHg</div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`font-bold ${
                          hrCritical ? "text-red-500" : "text-slate-700"
                        }`}
                      >
                        {v.heart_rate}
                      </span>
                      <div className="text-[11px] text-gray-400">bpm</div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">

                      <span
                        className={`font-bold ${
                          spo2Critical ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {v.spo2}%
                      </span>

                      <div className="w-20 h-1.5 mt-1 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className={`h-full ${
                            spo2Critical ? "bg-red-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(v.spo2, 100)}%` }}
                        />

                      </div>

                    </td>

                    <td className="py-4 px-4 sm:px-6">

                      <span
                        className={`font-bold ${
                          sugarCritical ? "text-red-500" : "text-slate-700"
                        }`}
                      >
                        {v.sugar_mg ?? "--"}
                      </span>

                      <div className="text-[11px] text-gray-400">mg/dL</div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    ) : (

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">

        <div className="text-4xl mb-3">✅</div>

        <p className="text-[13px] font-black tracking-widest text-gray-400 uppercase">
          All Clear
        </p>

        <p className="text-sm text-gray-400 mt-1">
          All patient vitals are within normal ranges.
        </p>

      </div>

    )}

  </div>
</div>
    </ProtectedRoute>
  );
}
