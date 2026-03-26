"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Patient = {
  patient_uid: string;
  name: string;
  email: string;
  age: number;
  blood_group?: string;
  smoking?: boolean;
  alcohol?: string;
  diet_preference?: string;
  physical_activity?: string;
  gender: string;
  chronic_diseases: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
  bmi?: number;
  bmi_category?: string;
};

type Vitals = {
  id: number;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  spo2: number;
  sugar_mg: number;
  recorded_at: string;
};

type Prescription = {
  id: number;
  disease: string;
  doctor_name: string;
  prescription_date: string;
  file_url: string;
};

type PatientNote = {
  id: number;
  note: string;
  medications_taken: string;
  created_at: string;
  doctor_comment?: string | null;
  patient_name: string;
};




const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB");
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const bpColor = (s: number, d: number) => {
  if (s >= 140 || d >= 90) return "text-red-600";
  if (s >= 130 || d >= 85) return "text-yellow-600";
  return "text-green-600";
};

const hrColor = (hr: number) => {
  if (hr < 60 || hr > 100) return "text-red-600";
  if (hr < 65 || hr > 90) return "text-yellow-600";
  return "text-green-600";
};

const spo2Color = (v: number) => {
  if (v < 92) return "text-red-600";
  if (v < 95) return "text-yellow-600";
  return "text-green-600";
};

const sugarColor = (v: number) => {
  if (v >= 180) return "text-red-600";
  if (v >= 140) return "text-yellow-600";
  return "text-green-600";
};

const getBPColor = (sys: number, dia: number) => {
  if (sys < 120 && dia < 80) return "text-green-600";
  if (sys <= 139 || dia <= 89) return "text-yellow-600";
  return "text-red-600";
};

const getHeartRateColor = (hr: number) => {
  if (hr >= 60 && hr <= 100) return "text-green-600";
  if (hr >= 50 && hr <= 110) return "text-yellow-600";
  return "text-red-600";
};

const getSpo2Color = (spo2: number) => {
  if (spo2 >= 95) return "text-green-600";
  if (spo2 >= 90) return "text-yellow-600";
  return "text-red-600";
};

const getSugarColor = (sugar: number) => {
  if (sugar <= 140) return "text-green-600";
  if (sugar <= 180) return "text-yellow-600";
  return "text-red-600";
};

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });



export default function DoctorPatientDetailsPage() {
  const { patientUid } = useParams();
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [activeCommentNoteId, setActiveCommentNoteId] = useState<number | null>(null);








  // ===============================
  // STEP 3.3 – Prepare chart-ready vitals data
  // ===============================
  const vitalsChartData = vitals.map((v) => ({
    time: `${formatDate(v.recorded_at)} ${formatTime(v.recorded_at)}`,
    systolic: v.systolic,
    diastolic: v.diastolic,
    heart_rate: v.heart_rate,
    spo2: v.spo2,
    sugar: v.sugar_mg,
  }));

  const fetchVitals = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients/${patientUid}/vitals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch vitals");
      }

      const data = await res.json();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
      );

      setVitals(sorted);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch vitals");
    }
  };

  useEffect(() => {
    if (!patientUid || !token) return;
    fetchVitals();
  }, [patientUid]);

  useEffect(() => {
    fetchAll();
  }, []);

  //Fetch Notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patient/${patientUid}/notes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setNotesLoading(false);
      }
    };

    if (patientUid) fetchNotes();
  }, [patientUid]);

  const handleCommentChange = (noteId: number, value: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, doctor_comment: value } : n
      )
    );
  };

  const saveDoctorComment = async (noteId: number) => {
    try {
      setSavingNoteId(noteId);

      const token = localStorage.getItem("token");
      const note = notes.find((n) => n.id === noteId);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/notes/${noteId}/comment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctor_comment: note?.doctor_comment,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      alert("Comment saved successfully ✅"); // TEMP feedback
    } catch (err) {
      alert("Failed to save comment ❌");
    } finally {
      setSavingNoteId(null);
    }
  };




  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [pRes, vRes, prRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients/${patientUid}`, {
          headers,
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients/${patientUid}/vitals`,
          { headers },
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions/doctor/${patientUid}`, {
          headers,
        }),
      ]);

      if (!pRes.ok) throw new Error("Access denied");

      const patientData = await pRes.json();
      const vitalsData = await vRes.json();
      const presData = await prRes.json();

      setPatient(patientData);
      setVitals(vitalsData);
      setPrescriptions(presData);
    } catch (err) {
      alert("Unable to access patient");
      router.push("/doctor/patients");
    } finally {
      setLoading(false);
    }
  };




  const handleDelete = async () => {
    const confirm = window.confirm("Remove this patient from your list?");
    if (!confirm) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients/${patientUid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    router.push("/doctor/patients");
  };

  if (loading) {
    return (
      <ProtectedRoute role="DOCTOR">
        <Navbar />
        <p className="p-6 text-gray-700">Loading patient details...</p>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="DOCTOR">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ================= PATIENT INFO ================= */}

        <div className="w-full py-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* PROFILE */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-6 sm:p-8">

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                {/* Avatar */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {patient?.name?.[0]}
                  <span className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 sm:border-4 border-white rounded-full"></span>
                </div>

                {/* Info */}
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {patient?.name}
                  </h2>

                  <p className="text-gray-500 mt-1 text-sm">
                    #{patient?.patient_uid} • {patient?.age} yrs • {patient?.gender}
                  </p>

                  <div className="mt-3 inline-block border px-4 py-2 rounded-lg text-sm text-gray-700 bg-gray-50 break-all">
                    ✉️ {patient?.email}
                  </div>
                </div>

              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">

                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 uppercase">Age</p>
                  <p className="text-xl font-bold">{patient?.age}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 uppercase">Blood</p>
                  <p className="text-xl font-bold text-red-600">
                    {patient?.blood_group}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 uppercase">BMI</p>
                  <p className="text-xl font-bold">{patient?.bmi}</p>
                </div>

              </div>
            </div>

            {/* HEALTH PROFILE */}
            <div className="bg-white rounded-3xl shadow-md p-6">

              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-6">
                Health Profile
              </h3>

              <div className="space-y-5">

                {[
                  { icon: "🚬", title: "Smoking", value: patient?.smoking || "None", level: "LOW", color: "bg-gray-100 text-gray-600" },
                  { icon: "🍺", title: "Alcohol", value: patient?.alcohol || "None", level: "MODERATE", color: "bg-orange-100 text-orange-600" },
                  { icon: "📈", title: "Activity", value: patient?.physical_activity || "None", level: "HIGH", color: "bg-green-100 text-green-600" },
                  { icon: "🍏", title: "Dietary", value: patient?.diet_preference || "None", level: "STRICT", color: "bg-blue-100 text-blue-600" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {item.icon}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.value}</p>
                      </div>

                    </div>

                    <span className={`px-3 py-1 text-xs rounded-full ${item.color}`}>
                      {item.level}
                    </span>

                  </div>
                ))}

              </div>
            </div>

            {/* MEDICAL BACKGROUND */}
            <div className="lg:col-span-3 bg-white rounded-3xl shadow-md p-6 sm:p-8">

              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Medical Background
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                {[
                  { title: "Chronic Diseases", data: patient?.chronic_diseases, color: "bg-orange-100 text-orange-700" },
                  { title: "Current Medications", data: patient?.current_medications, color: "bg-purple-100 text-purple-700" },
                  { title: "Allergies", data: patient?.allergies, color: "bg-red-100 text-red-600" }
                ].map((section, i) => (
                  <div key={i}>

                    <p className="text-xs text-gray-400 uppercase mb-2">
                      {section.title}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(section.data || "None").split(",").map((item, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs ${section.color}`}
                        >
                          {item.trim()}
                        </span>
                      ))}
                    </div>

                  </div>
                ))}

              </div>

              <div className="mt-8">
                <p className="text-xs text-gray-400 uppercase mb-2">
                  Medical History
                </p>

                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                  {patient?.medical_history}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ================= VITALS ================= */}

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Vitals
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-sm min-w-[600px]">

              <thead>
                <tr className="text-gray-400 uppercase text-xs border-b">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">BP</th>
                  <th className="py-3 px-4 text-left">HR</th>
                  <th className="py-3 px-4 text-left">SpO₂</th>
                  <th className="py-3 px-4 text-left">Sugar</th>
                </tr>
              </thead>

              <tbody>

                {vitals.slice(0, 5).map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">

                    <td className="py-3 px-4">
                      {formatDateTime(v.recorded_at)}
                    </td>

                    <td className={`py-3 px-4 ${getBPColor(v.systolic, v.diastolic)}`}>
                      {v.systolic}/{v.diastolic}
                    </td>

                    <td className={`py-3 px-4 ${getHeartRateColor(v.heart_rate)}`}>
                      {v.heart_rate}
                    </td>

                    <td className={`py-3 px-4 ${getSpo2Color(v.spo2)}`}>
                      {v.spo2}%
                    </td>

                    <td className={`py-3 px-4 ${getSugarColor(v.sugar_mg)}`}>
                      {v.sugar_mg}
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>

        </div>

        {/* ================= CHARTS ================= */}

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow border">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5">

            <h2 className="text-xl font-bold">
              Vitals · Live Monitoring
            </h2>

            <span className="text-xs text-gray-500">
              Auto-refreshing
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <ChartBox title="Blood Pressure (mmHg)">
              <VitalsLineChart
                data={vitalsChartData}
                lines={[
                  { key: "systolic", color: "#2563eb", name: "Systolic" },
                  { key: "diastolic", color: "#16a34a", name: "Diastolic" }
                ]}
              />
            </ChartBox>

            <ChartBox title="Heart Rate (BPM)">
              <VitalsLineChart
                data={vitalsChartData}
                lines={[{ key: "heart_rate", color: "#dc2626", name: "Heart Rate" }]}
              />
            </ChartBox>

            <ChartBox title="SpO₂ (%)">
              <VitalsLineChart
                data={vitalsChartData}
                lines={[{ key: "spo2", color: "#059669", name: "SpO₂" }]}
              />
            </ChartBox>

            <ChartBox title="Blood Sugar (mg/dL)">
              <VitalsLineChart
                data={vitalsChartData}
                lines={[{ key: "sugar", color: "#7c3aed", name: "Sugar" }]}
              />
            </ChartBox>

          </div>
        </div>

        {/* ================= PRESCRIPTIONS ================= */}

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Prescriptions
          </h2>

          <div className="space-y-4">

            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-xl p-4 bg-gray-50 hover:bg-gray-100">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {p.disease}
                    </h3>

                    <p className="text-sm text-gray-600">
                      Dr. {p.doctor_name}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(p.prescription_date).toLocaleDateString("en-IN")}
                  </span>

                </div>

                <div className="flex justify-end mt-3">

                  <a
                    onClick={() => {
                      const newTab = window.open();
                      if (newTab) {
                        newTab.document.write(`
        <iframe 
          src="${p.file_url}" 
          frameborder="0" 
          style="width:100%; height:100vh;"
        ></iframe>
      `);
                      }
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Prescription →
                  </a>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* ================= PATIENT NOTES ================= */}
        {/* 📝 Patient Notes Section */}
        {/* ================= MEDICAL JOURNAL ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-10">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-lg">💬</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Medical Journal
              </h2>
            </div>

            <span className="text-sm text-gray-400">
              Past 30 Days
            </span>
          </div>

          {/* Timeline Body */}
          <div className="p-6 space-y-10 relative">

            {notes.map((note, index) => (
              <div key={note.id} className="relative pl-10">

                {/* Vertical Line */}
                {index !== notes.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200"></div>
                )}

                {/* Circle */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {new Date(note.created_at).toLocaleString()}
                </p>

                {/* Main Card */}
                <div className="bg-gray-50 rounded-2xl p-5 mt-3">

                  {/* Patient Note */}
                  <p className="text-gray-900 font-medium">
                    {note.note}
                  </p>

                  {/* Medication */}
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="italic">
                      Medication: {note.medications_taken || "None"}
                    </span>
                  </p>

                  {/* Doctor Feedback */}
                  {note.doctor_comment ? (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-green-700 uppercase mb-1">
                        Doctor Feedback
                      </p>
                      <p className="text-green-800 text-sm">
                        {note.doctor_comment}
                      </p>

                      <button
                        onClick={() => setActiveCommentNoteId(note.id)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Edit Clinical Note
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCommentNoteId(note.id)}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Add Clinical Note
                    </button>
                  )}

                  {/* Edit Comment Box */}
                  {activeCommentNoteId === note.id && (
                    <div className="mt-4">
                      <textarea
                        className="w-full border rounded-lg p-3 text-sm"
                        placeholder="Write doctor feedback..."
                        value={note.doctor_comment || ""}
                        onChange={(e) =>
                          handleCommentChange(note.id, e.target.value)
                        }
                      />

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => {
                            saveDoctorComment(note.id);
                            setActiveCommentNoteId(null);
                          }}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setActiveCommentNoteId(null)}
                          className="text-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <p className="text-gray-400 text-sm">
                No journal entries available.
              </p>
            )}

          </div>
        </div>

        {/* DELETE */}

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold w-full sm:w-auto"
        >
          Delete Patient
        </button>

      </div>
    </ProtectedRoute>
  );
}

function ChartBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function VitalsLineChart({
  data,
  lines,
}: {
  data: any[];
  lines: { key: string; color: string; name: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            name={l.name}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
