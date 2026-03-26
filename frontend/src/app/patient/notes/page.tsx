"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

type PatientNote = {
  id: number;
  note: string;
  medications_taken: string;
  doctor_comment?: string | null;
  created_at: string;
};


export default function PatientNotesPage() {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [note, setNote] = useState("");
  const [medications, setMedications] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editMeds, setEditMeds] = useState("");


  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= FETCH NOTES ================= */
  const fetchNotes = async () => {
    if (!token) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ================= ADD NOTE ================= */
  const addNote = async () => {
    if (!note.trim()) return alert("Note cannot be empty");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        note,
        medications_taken: medications,
      }),
    });

    setNote("");
    setMedications("");
    fetchNotes();
  };

  const deleteNote = async (id: number) => {
    const confirmDelete = window.confirm("Delete this note?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/note/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchNotes();
  };

  const updateNote = async (noteId: number) => {
    const token = localStorage.getItem("token");

    if (!editNote.trim()) {
      alert("Note cannot be empty");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/note/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note: editNote,
            medications_taken: editMeds,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update note");
      }

      // ✅ reset edit state
      setEditingId(null);
      setEditNote("");
      setEditMeds("");

      // ✅ refresh notes list
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Failed to update note");
    }
  };



  return (
    <ProtectedRoute role="PATIENT">
      <Navbar />

      <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Daily Health Journal
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Track symptoms, meds, and doctor feedback
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          </p>
        </div>



        {/* ADD NOTE */}
        {/* NEW ENTRY CARD */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-gray-800 font-semibold flex items-center gap-2">
              ➕ New Health Entry
            </h2>

            <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
              TODAY
            </span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Symptoms & Feelings
              </label>

              <textarea
                placeholder="Describe your symptoms, mood, or pain level..."
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medications
              </label>

              <input
                type="text"
                placeholder="e.g. Ibuprofen, Vitamin D"
                className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={addNote}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-white py-3 rounded-xl font-semibold shadow-md transition-all"
            >
              ✔ Save Journal Entry
            </button>

          </div>
        </div>



        {/* NOTES LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            📅 History
          </h2>


          {loading && <p>Loading notes...</p>}

          {!loading && notes.length === 0 && (
            <p className="text-gray-600">No notes yet.</p>
          )}

          {notes.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"

            >
              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                📅 {new Date(n.created_at).toLocaleString()}
              </div>

              {/* Note */}
              <p className="mt-3 text-gray-900">
                {n.note}
              </p>

              {/* Medications */}
              {n.medications_taken && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {n.medications_taken.split(",").map((med, i) => (
                    <span
                      key={i}
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                    >
                      💊 {med.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Doctor Feedback */}
              {n.doctor_comment ? (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4"
                >
                  <p className="text-green-800 text-sm font-semibold mb-1">
                    🩺 Doctor’s Feedback
                  </p>
                  <p className="text-green-700 text-sm">
                    {n.doctor_comment}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm italic text-gray-400">
                  ⏳ Pending doctor review...
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-4 text-sm">
                <button
                  onClick={() => {
                    setEditingId(n.id);
                    setEditNote(n.note);
                    setEditMeds(n.medications_taken || "");
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Delete
                </button>
              </div>


              {/* 🔴 STEP 5.3 EDIT FORM (ADD HERE) */}
              {editingId === n.id && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />

                  <input
                    value={editMeds}
                    onChange={(e) => setEditMeds(e.target.value)}
                    placeholder="Medications"
                    className="w-full border rounded-lg p-3"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => updateNote(n.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600"
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
