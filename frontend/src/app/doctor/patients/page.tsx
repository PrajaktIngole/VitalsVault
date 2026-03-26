"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

type Patient = {
  patient_uid: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  chronic_diseases: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
};

type Prescription = {
  id: number;
  prescription_date: string;
  disease: string;
  doctor_name: string;
  file_url: string;
};

export default function DoctorPatientsPage() {
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const [savedPatients, setSavedPatients] = useState<Patient[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    fetchSavedPatients();
  }, [isMounted]);

  const fetchSavedPatients = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, skipping fetchSavedPatients");
      setLoadingSaved(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch saved patients");
        setLoadingSaved(false);
        return;
      }

      const data = await res.json();
      setSavedPatients(data);
    } catch (err) {
      console.error("Error loading saved patients", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  /* ===============================
     SEARCH PATIENT (ONLY FETCH DATA)
     =============================== */
  const handleSearch = async () => {
    setError("");

    if (!patientId.trim()) {
      setError("Please enter Patient ID");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // 1️⃣ Add patient to doctor's list (PERSIST)
      const addRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patient_uid: patientId }),
      });

      const addData = await addRes.json();

      if (!addRes.ok) {
        setError(addData.message || "Unable to add patient");
        setLoading(false);
        return;
      }

      // 2️⃣ Reload saved patients
      await fetchSavedPatients();

      // 3️⃣ Reset input
      setPatientId("");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ADD PATIENT (EXPLICIT ACTION)
     =============================== */
  const handleAddPatient = async () => {
    if (!patient) return;

    const token = localStorage.getItem("token");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patient_uid: patient.patient_uid }),
    });

    await fetchSavedPatients();
  };

  /* ===============================
     DELETE PATIENT
     =============================== */
  const handleDelete = async () => {
    if (!patient) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this patient from your list?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/patients/${patient.patient_uid}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPatient(null);
    setShowDetails(false);
    fetchSavedPatients();
  };

  /* ===============================
     FETCH PRESCRIPTIONS
     =============================== */
  const fetchPrescriptions = async (patientUid: string) => {
    const token = localStorage.getItem("token");
    setLoadingPrescriptions(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions/doctor/${patientUid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setPrescriptions(data);
    } catch {
      console.error("Failed to fetch prescriptions");
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  /* ===============================
     HELPER: IS PATIENT SAVED?
     =============================== */
  const isAlreadySaved =
    patient && savedPatients.some((p) => p.patient_uid === patient.patient_uid);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 200) {
        router.replace("/patient/dashboard");
      }
    });
  }, [router]);


  /* ===============================
     UI
     =============================== */
  return (
    <ProtectedRoute role="DOCTOR">
      <Navbar />



      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

          <div>
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
              Patient Management
            </h1>

            <p className="text-sm text-gray-500">
              View histories, check prescriptions, and manage care.
            </p>
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            + Add Patient
          </button>

        </div>


        {/* Search Bar */}
        <div className="relative">

          <input
            type="text"
            placeholder="Search by Patient ID (e.g. PAT-xxxx)"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 text-gray-900 text-sm sm:text-base"
          />

          <span className="absolute left-3 top-3 text-gray-400">🔍</span>

        </div>


        {error && (
          <p className="text-red-600 font-medium">{error}</p>
        )}



        {/* Patients Table */}

        {!loadingSaved && savedPatients.length > 0 && (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[650px]">

                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">

                  <tr>
                    <th className="p-3 sm:p-4 text-left">Patient</th>
                    <th className="p-3 sm:p-4 text-left">ID</th>
                    <th className="p-3 sm:p-4 text-left">Status</th>
                    <th className="p-3 sm:p-4 text-left">Age / Gender</th>
                    <th className="p-3 sm:p-4 text-center">Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {savedPatients.map((p) => {

                    const isCritical = p.chronic_diseases;

                    return (

                      <tr
                        key={p.patient_uid}
                        className="border-t hover:bg-gray-50 transition"
                      >

                        {/* Patient */}
                        <td className="p-3 sm:p-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                              {p.name?.charAt(0)}
                            </div>

                            <div>
                              <p className="font-bold text-slate-800 text-sm sm:text-[15px]">
                                {p.name}
                              </p>
                            </div>

                          </div>

                        </td>


                        {/* ID */}

                        <td className="p-3 sm:p-4 font-medium text-gray-700">
                          {p.patient_uid}
                        </td>


                        {/* Status */}

                        <td className="p-3 sm:p-4">

                          {isCritical ? (

                            <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                              Critical
                            </span>

                          ) : (

                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                              Normal
                            </span>

                          )}

                        </td>


                        {/* Age / Gender */}

                        <td className="p-3 sm:p-4 text-gray-700">
                          {p.age} / {p.gender}
                        </td>


                        {/* Actions */}

                        <td className="p-3 sm:p-4">

                          <div className="flex justify-center gap-4">

                            <button
                              onClick={() =>
                                router.push(`/doctor/patients/${p.patient_uid}`)
                              }
                              className="text-indigo-600 hover:underline font-semibold text-sm"
                            >
                              👁 View
                            </button>

                            <button
                              onClick={() => {
                                setPatient(p);
                                handleDelete();
                              }}
                              className="text-red-600 hover:underline font-semibold text-sm"
                            >
                              🗑 Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        )}



        {loadingSaved && (
          <p className="text-gray-600">Loading patients...</p>
        )}

      </div>

    </ProtectedRoute>
  );
}
