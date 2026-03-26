"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Vitals = {
  id: number;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  spo2: number;
  sugar_mg: number;
  recorded_at: string;
};

/* ================= HELPERS ================= */

const getBPColor = (sys: number, dia: number) => {
  if (sys <= 129 && dia <= 84) return "text-emerald-500";
  if (sys <= 139 || dia <= 89) return "text-amber-500";
  return "text-red-500";
};

const getHeartRateColor = (hr: number) => {
  if (hr >= 60 && hr <= 100) return "text-emerald-500";
  if (hr >= 50 && hr <= 110) return "text-amber-500";
  return "text-red-500";
};

const getSpo2Color = (spo2: number) => {
  if (spo2 >= 95) return "text-emerald-500";
  if (spo2 >= 90) return "text-amber-500";
  return "text-red-500";
};

const getSugarColor = (sugar: number) => {
  if (sugar <= 140) return "text-purple-600";
  if (sugar <= 180) return "text-purple-500";
  return "text-purple-700";
};

const getBPStatus = (sys: number, dia: number) => {
  if (sys <= 129 && dia <= 84) return { label: "NORMAL", bg: "bg-emerald-50", text: "text-emerald-500" };
  if (sys <= 139 || dia <= 89) return { label: "ELEVATED", bg: "bg-amber-50", text: "text-amber-500" };
  return { label: "WARNING", bg: "bg-red-50", text: "text-red-500" };
};

const getHeartRateStatus = (hr: number) => {
  if (hr >= 60 && hr <= 100) return { label: "NORMAL", bg: "bg-emerald-50", text: "text-emerald-500" };
  if (hr >= 50 && hr <= 110) return { label: "ELEVATED", bg: "bg-amber-50", text: "text-amber-500" };
  return { label: "WARNING", bg: "bg-red-50", text: "text-red-500" };
};

const getSpo2Status = (spo2: number) => {
  if (spo2 >= 95) return { label: "NORMAL", bg: "bg-emerald-50", text: "text-emerald-500" };
  if (spo2 >= 90) return { label: "LOW", bg: "bg-amber-50", text: "text-amber-500" };
  return { label: "CRITICAL", bg: "bg-red-50", text: "text-red-500" };
};

const getSugarStatus = (sugar: number) => {
  if (sugar <= 140) return { label: "STABLE", bg: "bg-emerald-50", text: "text-emerald-600" };
  if (sugar <= 180) return { label: "ELEVATED", bg: "bg-amber-50", text: "text-amber-500" };
  return { label: "WARNING", bg: "bg-red-50", text: "text-red-500" };
};

const formatDateTime = (value: string) => {
  const d = new Date(value);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
};

/* ================= PAGE ================= */

export default function PatientDashboard() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const latestVitals =
    Array.isArray(vitals) && vitals.length > 0 ? vitals[0] : null;

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    heart_rate: "",
    spo2: "",
    sugar_mg: "",
  });

  const isHighBP =
    latestVitals &&
    (latestVitals.systolic >= 140 || latestVitals.diastolic >= 90);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      if (res.status === 404) {
        router.replace("/patient/profile");
      } else if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    });
  }, [router]);

  /* ================= AUTH ================= */

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  /* ================= DOWNLOAD PDF ================= */
  const downloadVitalsPDF = () => {
    const pdf = new jsPDF();

    // Table headers
    const tableColumn = ["Date", "BP", "HR", "SpO₂", "Sugar"];

    // Table rows
    const tableRows: any[] = [];

    vitals.forEach((v: any) => {
      const rowData = [
        new Date(v.recorded_at).toLocaleString(),
        `${v.systolic}/${v.diastolic}`,
        v.heart_rate,
        `${v.spo2}%`,
        v.sugar_mg,
      ];
      tableRows.push(rowData);
    });

    autoTable(pdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    pdf.text("Vitals History Report", 14, 15);
    pdf.save("vitals-history.pdf");
  };

  /* ================= FETCH ================= */

  const fetchVitals = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/vitals/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Vitals API response:", data);
      if (Array.isArray(data)) {
        setVitals(data);
      } else if (Array.isArray(data.vitals)) {
        setVitals(data.vitals);
      } else {
        setVitals([]); // fallback safety
      }
    } catch (err) {
      console.error("Failed to fetch vitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchVitals();
  }, [token]);

  /* ================= SAVE ================= */

  const saveVitals = async () => {
    if (!token) return;

    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/vitals/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/vitals`;

    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        heart_rate: Number(form.heart_rate),
        spo2: Number(form.spo2),
        sugar_mg: Number(form.sugar_mg),
      }),
    });

    setShowForm(false);
    setEditingId(null);
    setForm({
      systolic: "",
      diastolic: "",
      heart_rate: "",
      spo2: "",
      sugar_mg: "",
    });

    fetchVitals();
  };

  /* ================= DELETE ================= */

  const deleteVitals = async (id: number) => {
    if (!token) return;

    const confirm = window.confirm("Delete this vitals record?");
    if (!confirm) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/vitals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchVitals();
  };

  /* ================= EDIT ================= */

  const editVitals = (v: Vitals) => {
    setEditingId(v.id);
    setForm({
      systolic: String(v.systolic),
      diastolic: String(v.diastolic),
      heart_rate: String(v.heart_rate),
      spo2: String(v.spo2),
      sugar_mg: String(v.sugar_mg),
    });
    setShowForm(true);
  };

  /* ================= UI ================= */
  console.log(profile);
  return (
    <ProtectedRoute role="PATIENT">
      <Navbar />
      <div id="vitals-pdf" className="bg-gray-50/30 min-h-screen pb-16">
        <div className="max-w-[1200px] mx-auto p-6 md:p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
                Patient Dashboard
              </h1>
              <div className="hidden md:block h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100/80 text-blue-600 font-bold w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white">
                  {profile?.profile?.name
                    ? profile.profile.name
                      .split(" ")
                      .map((n: any) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                    : "JD"}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-800 text-lg">
                    {profile?.profile?.name || "Patient"}
                  </span>

                  <span className="text-gray-300 text-sm font-bold">
                    #{profile?.profile?.patient_uid || "----"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:-translate-y-0.5"
              >
                <span className="text-lg leading-none">+</span> ADD VITALS
              </button>
              <button
                onClick={downloadVitalsPDF}
                className="bg-white hover:bg-gray-50 text-slate-600 border border-gray-200 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm shadow-sm transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                EXPORT
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-500 font-medium">Loading vitals...</p>}

          {!loading && Array.isArray(vitals) && vitals.length === 0 && (
            <p className="text-gray-500 font-medium bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">No vitals recorded yet. Click "Add Vitals" to get started.</p>
          )}

          {latestVitals && (
            <div className="mb-12">
              <div className="grid md:grid-cols-4 gap-6">

                {/* Blood Pressure */}
                {(() => { const bpStatus = getBPStatus(latestVitals.systolic, latestVitals.diastolic); return (
                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md ${isHighBP ? "ring-2 ring-red-400 ring-offset-2" : ""}`}>
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">BLOOD PRESSURE</p>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${bpStatus.bg} ${bpStatus.text}`}>
                      {bpStatus.label}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[42px] font-black leading-none flex items-baseline gap-1 ${getBPColor(latestVitals.systolic, latestVitals.diastolic)}`}>
                      {latestVitals.systolic}/{latestVitals.diastolic}
                      <span className="text-sm font-bold text-gray-400 tracking-wide">mmHg</span>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +2.4%
                  </div>
                </div>
                ); })()}

                {/* Heart Rate */}
                {(() => { const hrStatus = getHeartRateStatus(latestVitals.heart_rate); return (
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">HEART RATE</p>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${hrStatus.bg} ${hrStatus.text}`}>
                      {hrStatus.label}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[42px] font-black leading-none flex items-baseline gap-1 ${getHeartRateColor(latestVitals.heart_rate) || 'text-emerald-500'}`}>
                      {latestVitals.heart_rate}
                      <span className="text-sm font-bold text-gray-400 tracking-wide">bpm</span>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    -1.1%
                  </div>
                </div>
                ); })()}

                {/* SpO₂ */}
                {(() => { const spo2Status = getSpo2Status(latestVitals.spo2); return (
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">OXYGEN (SPO₂)</p>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${spo2Status.bg} ${spo2Status.text}`}>
                      {spo2Status.label}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[42px] font-black leading-none flex items-baseline gap-1 text-orange-400`}>
                      {latestVitals.spo2}<span className="text-[32px]">%</span>
                      <span className="text-sm font-bold text-gray-400 tracking-wide ml-1">Saturation</span>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    -1.1%
                  </div>
                </div>
                ); })()}

                {/* Blood Sugar */}
                {(() => { const sugarStatus = getSugarStatus(latestVitals.sugar_mg); return (
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">BLOOD SUGAR</p>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${sugarStatus.bg} ${sugarStatus.text}`}>
                      {sugarStatus.label}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[42px] font-black leading-none flex items-baseline gap-1 ${getSugarColor(latestVitals.sugar_mg)}`}>
                      {latestVitals.sugar_mg}
                      <span className="text-sm font-bold text-gray-400 tracking-wide">mg/dL</span>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +2.4%
                  </div>
                </div>
                ); })()}

              </div>
            </div>
          )}

          {/* ================= CHARTS ================= */}
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-[13px] font-black tracking-widest text-slate-400 uppercase">
              REAL-TIME TELEMETRY
            </h2>
            <span className="text-[#9CB3CD] text-[11px] font-bold">
              Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <ChartCard title="PRESSURE" dotColor="bg-emerald-400">
              <VitalsDotChart
                data={vitals.slice().reverse()}
                lines={[
                  { key: "systolic", color: "#3b82f6" },
                  { key: "diastolic", color: "#10b981" },
                ]}
                domain={[80, 160]}
                ticks={[80, 160]}
              />
            </ChartCard>

            <ChartCard title="PULSE" dotColor="bg-emerald-400">
              <VitalsDotChart
                data={vitals.slice().reverse()}
                lines={[
                  { key: "heart_rate", color: "#ef4444" },
                ]}
                domain={[60, 120]}
                ticks={[60, 120]}
              />
            </ChartCard>

            <ChartCard title="O₂ SAT" dotColor="bg-emerald-400">
              <VitalsDotChart
                data={vitals.slice().reverse()}
                lines={[
                  { key: "spo2", color: "#f59e0b" },
                ]}
                domain={[50, 100]}
                ticks={[50, 100]}
              />
            </ChartCard>

            <ChartCard title="SUGAR" dotColor="bg-emerald-400">
              <VitalsDotChart
                data={vitals.slice().reverse()}
                lines={[
                  { key: "sugar_mg", color: "#a855f7" },
                ]}
                domain={[100, 200]}
                ticks={[100, 200]}
              />
            </ChartCard>
          </div>

          {/* ================= TABLE ================= */}

          {!loading && Array.isArray(vitals) && vitals.length > 0 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 pb-4 flex justify-between items-center bg-white">
                <h2 className="text-[13px] font-black tracking-widest text-slate-900 uppercase">
                  HISTORICAL EVENT LOG
                </h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </button>
              </div>

              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-sm">
                  <thead className="bg-white text-[#9CB3CD] text-[11px] font-black tracking-widest uppercase text-left border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6">TIMESTAMP</th>
                      <th className="py-4 px-6 text-center">BP</th>
                      <th className="py-4 px-6 text-center">HR</th>
                      <th className="py-4 px-6 text-center">SPO₂</th>
                      <th className="py-4 px-6 text-center">SUGAR</th>
                      <th className="py-4 px-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vitals.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-6 px-6 text-slate-600 font-bold flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {formatDateTime(v.recorded_at)}
                        </td>
                        <td
                          className={`py-6 px-6 text-center font-black ${getBPColor(
                            v.systolic,
                            v.diastolic
                          )}`}
                        >
                          {v.systolic}/{v.diastolic}
                        </td>

                        <td
                          className={`py-6 px-6 text-center font-black ${getHeartRateColor(
                            v.heart_rate
                          )}`}
                        >
                          {v.heart_rate}
                        </td>

                        <td
                          className={`py-6 px-6 text-center font-black ${getSpo2Color(
                            v.spo2
                          )} text-orange-400`}
                        >
                          {v.spo2}%
                        </td>

                        <td
                          className={`py-6 px-6 text-center font-black ${getSugarColor(
                            v.sugar_mg
                          )}`}
                        >
                          {v.sugar_mg}
                        </td>

                        <td className="py-6 px-6 text-right">
                          <div className="flex gap-4 justify-end">
                            <button
                              onClick={() => editVitals(v)}
                              className="text-blue-600 font-black hover:text-blue-800 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteVitals(v.id)}
                              className="text-red-600 font-black hover:text-red-800 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL ================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Edit Vitals" : "Add Vitals"}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter today’s vital measurements
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-5 space-y-4">
                {/* Systolic */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={form.systolic}
                    onChange={(e) =>
                      setForm({ ...form, systolic: e.target.value })
                    }
                    placeholder="e.g. 120"
                    className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Diastolic */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={form.diastolic}
                    onChange={(e) =>
                      setForm({ ...form, diastolic: e.target.value })
                    }
                    placeholder="e.g. 80"
                    className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Heart Rate */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={form.heart_rate}
                    onChange={(e) =>
                      setForm({ ...form, heart_rate: e.target.value })
                    }
                    placeholder="e.g. 72"
                    className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* SpO2 */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    SpO₂ (%)
                  </label>
                  <input
                    type="number"
                    value={form.spo2}
                    onChange={(e) =>
                      setForm({ ...form, spo2: e.target.value })
                    }
                    placeholder="e.g. 98"
                    className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Sugar */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={form.sugar_mg}
                    onChange={(e) =>
                      setForm({ ...form, sugar_mg: e.target.value })
                    }
                    placeholder="e.g. 110"
                    className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={saveVitals}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ChartCard({
  title,
  dotColor,
  children,
}: {
  title: string;
  dotColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6 flex flex-col h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[12px] font-black text-slate-700 tracking-widest uppercase">
          {title}
        </h3>
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor || 'bg-gray-300'}`}></span>
      </div>

      <div className="flex-1 w-full min-h-0 pl-0 ml-0 border-b border-dashed border-gray-100 pb-2">
        {children}
      </div>
    </div>
  );
}

function VitalsDotChart({
  data,
  lines,
  domain,
  ticks
}: {
  data: any[];
  lines: { key: string; color: string }[];
  domain?: [number, number];
  ticks?: number[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: -10 }}>
        {/* Only hide vertical grid lines, keep horizontal ones dashed very lightly to match UI */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />

        <XAxis
          dataKey="recorded_at"
          tick={false}
          axisLine={false}
        />

        <YAxis
          tick={{ fill: "#cbd5e1", fontSize: 10, fontWeight: "900" }}
          axisLine={false}
          tickLine={false}
          domain={domain}
          ticks={ticks}
          tickCount={2}
        />

        <Tooltip
          labelFormatter={(v) => formatDateTime(v)}
          contentStyle={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            fontWeight: "bold",
            padding: "12px 16px"
          }}
          itemStyle={{ fontWeight: "black" }}
        />

        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            strokeWidth={2} // Show the connecting line
            dot={{ r: 5.5, strokeWidth: 3, fill: "white", stroke: l.color }}
            activeDot={{ r: 7.5, strokeWidth: 3, fill: "white", stroke: l.color }}
            isAnimationActive={true}
            animationDuration={1500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}