"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

type Prescription = {
  id: number;
  prescription_date: string;
  disease: string;
  doctor_name: string;
  file_url: string;
};

export default function PatientPrescriptionsPage() {
  // ===== STATES =====
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [disease, setDisease] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editDisease, setEditDisease] = useState("");
  const [editDoctorName, setEditDoctorName] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ===== FETCH PRESCRIPTIONS =====
  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    console.log("Prescription API response:", data);

    // 🔥 IMPORTANT FIX
    if (Array.isArray(data)) {
      setPrescriptions(data);
    } else if (Array.isArray(data.prescriptions)) {
      setPrescriptions(data.prescriptions);
    } else {
      setPrescriptions([]); // fallback safety
    }

    setLoading(false);
  };


  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // ===== ADD PRESCRIPTION =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a prescription file");
      return;
    }

    setSubmitting(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("prescription_date", prescriptionDate);
    formData.append("disease", disease);
    formData.append("doctor_name", doctorName);
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed");
        setSubmitting(false);
        return;
      }

      // Reset form
      setPrescriptionDate("");
      setDisease("");
      setDoctorName("");
      setFile(null);
      setShowForm(false);

      fetchPrescriptions();

    } catch (error) {
      console.error(error);
      alert("Server error while uploading");
    }

    setSubmitting(false);
  };

  return (
    <ProtectedRoute role="PATIENT">
      <Navbar />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

          {/* Left Side */}
          <div>
            <p className="text-sm font-medium tracking-wider text-blue-600 uppercase">
              Medical Records
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-500">Prescriptions</span>
            </p>

            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              My Prescriptions
            </h1>

            <p className="text-gray-500 mt-2">
              Manage and access your medical history securely.
            </p>
          </div>

          {/* Button */}
          <div className="mt-6 md:mt-0">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200"
            >
              <span className="text-xl">+</span>
              {showForm ? "Cancel" : "Add New Prescription"}
            </button>
          </div>

        </div>




        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl">
                📄
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Add New Record
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Symptom / Disease */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Symptom / Disease
                </label>
                <input
                  type="text"
                  placeholder="e.g. Migraine, Fever, Post-op check"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  required
                  className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Doctor + Date Row */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Consulting Doctor */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Consulting Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Prescription Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Prescription Date
                  </label>
                  <input
                    type="date"
                    value={prescriptionDate}
                    onChange={(e) => setPrescriptionDate(e.target.value)}
                    required
                    className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Upload Attachment
                </label>

                <div className="mt-3 border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition">

                  {!file ? (
                    <>
                      <p className="text-gray-600">
                        Drag and drop file or{" "}
                        <label className="text-blue-600 font-semibold cursor-pointer">
                          Browse
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) =>
                              setFile(e.target.files ? e.target.files[0] : null)
                            }
                            className="hidden"
                            required
                          />
                        </label>
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        PDF, JPG, PNG up to 5MB
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-green-600 font-semibold">
                        ✅ File Selected
                      </p>

                      <p className="text-gray-900 font-medium">
                        {file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg transition"
              >
                {submitting ? "Saving..." : "Securely Save Prescription"}
              </button>

            </form>
          </div>
        )}


        {/* Prescription List */}
        {loading && <p className="text-gray-700">Loading prescriptions...</p>}

        {!loading && prescriptions.length === 0 && (
          <p className="text-gray-700">No prescriptions added yet.</p>
        )}

        {/* Prescription List */}
        <div className="space-y-6">
          {Array.isArray(prescriptions) &&
            prescriptions.map((p) => (
              <div key={p.id}>

                {/* ================= CARD ================= */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                  {/* LEFT SIDE */}
                  <div className="flex-1">

                    {/* Tags */}
                    <div className="flex gap-3 mb-4">
                      <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                        VERIFIED
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                        GENERAL
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {p.disease}
                    </h2>

                    {/* Doctor + Date */}
                    <div className="flex flex-col md:flex-row md:items-center gap-8">

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          👤
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            Consulting Doctor
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {p.doctor_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                          📅
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            Service Date
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {formatDate(p.prescription_date)}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex flex-col gap-4 w-full md:w-auto">

                    <button
                      onClick={() => {
                        const newTab = window.open();
                        if (newTab) {
                          newTab.document.write(`
        <iframe 
          src="${p.file_url}" 
          frameborder="0" 
          style="width:100%;height:100vh;"
        ></iframe>
      `);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition"
                    >
                      🔗 View File
                    </button>

                    <div className="flex gap-3 justify-center md:justify-end">

                      <button
                        onClick={() => {
                          setEditingId(p.id);
                          setEditDate(p.prescription_date);
                          setEditDisease(p.disease);
                          setEditDoctorName(p.doctor_name);
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition"
                      >
                        ✏ Edit
                      </button>

                      <button
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions/${p.id}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          fetchPrescriptions();
                        }}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition"
                      >
                        🗑 Delete
                      </button>

                    </div>
                  </div>
                </div>

                {/* ================= EDIT FORM ================= */}
                {editingId === p.id && (
                  <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 mt-4 space-y-6 shadow-sm">

                    <h3 className="text-xl font-bold text-gray-800">
                      Edit Prescription
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Symptom / Disease
                      </label>
                      <input
                        value={editDisease}
                        onChange={(e) => setEditDisease(e.target.value)}
                        className="mt-2 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Consulting Doctor
                        </label>
                        <input
                          value={editDoctorName}
                          onChange={(e) => setEditDoctorName(e.target.value)}
                          className="mt-2 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Prescription Date
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="mt-2 w-full bg-white border border-gray-200 rounded-2xl px-5 py-4"
                        />
                      </div>

                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem("token");

                          await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/prescriptions/${p.id}`,
                            {
                              method: "PUT",
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                prescription_date: editDate,
                                disease: editDisease,
                                doctor_name: editDoctorName,
                              }),
                            }
                          );

                          setEditingId(null);
                          fetchPrescriptions();
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                      >
                        Save Changes
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 px-6 py-3 rounded-xl font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
        </div>


      </div>
    </ProtectedRoute>
  );
}
