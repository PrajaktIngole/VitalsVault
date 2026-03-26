// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import Navbar from "@/components/Navbar";

// export default function PatientProfilePage() {
//   const router = useRouter();

//   const [form, setForm] = useState({
//     age: "",
//     gender: "",
//     chronic_diseases: "",
//     medical_history: "",
//     current_medications: "",
//     allergies: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     const token = localStorage.getItem("token");

//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(form),
//     });

//     if (res.ok) {
//       router.push("/patient/dashboard");
//     }
//   };

//   return (
//     <ProtectedRoute role="PATIENT">
//       <div className="min-h-screen bg-gray-100">
//         <Navbar />

//         <div className="flex justify-center p-6">
//           <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">
//               Complete Your Health Profile
//             </h2>

//             {[
//               ["age", "Age"],
//               ["gender", "Gender"],
//               ["chronic_diseases", "Chronic Diseases"],
//               ["medical_history", "Medical History"],
//               ["current_medications", "Current Medications"],
//               ["allergies", "Allergies"],
//             ].map(([key, label]) => (
//               <input
//                 key={key}
//                 name={key}
//                 placeholder={label}
//                 className="w-full border border-gray-400 p-3 rounded mb-4 text-gray-800"
//                 onChange={handleChange}
//               />
//             ))}

//             <button
//               onClick={handleSubmit}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
//             >
//               Save & Continue
//             </button>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function PatientProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    age: "",
    gender: "",
    blood_group: "",
    smoking: false,
    alcohol: "",
    diet_preference: "",
    physical_activity: "",
    chronic_diseases: "",
    medical_history: "",
    current_medications: "",
    allergies: "",
  });


  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (res.status === 200) {
      router.replace("/patient/dashboard");
    }
  });
}, [router]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/patient/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/patient/dashboard");
    }
  };

  return (
    <ProtectedRoute role="PATIENT">
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="flex justify-center px-4 py-10">
          <div className="w-full max-w-2xl rounded-2xl shadow-xl bg-white overflow-hidden">

            {/* 🔵 Header */}
            <div className="bg-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">
                Health Profile
              </h2>
              <p className="text-blue-100 mt-1">
                Please complete your medical information securely below.
              </p>
            </div>

            {/* 📋 Form */}
            <div className="px-8 py-8 space-y-6">

              {/* Age & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Ex: 32"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="smoking"
                  checked={form.smoking}
                  onChange={(e) =>
                    setForm({ ...form, smoking: e.target.checked })
                  }
                />
                <label className="text-sm text-gray-700">
                  Smoking
                </label>
              </div>

              <select
                name="alcohol"
                value={form.alcohol}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2"
              >
                <option value="">Alcohol Consumption</option>
                <option value="No">No</option>
                <option value="Occasionally">Occasionally</option>
                <option value="Yes">Yes</option>
              </select>


              <select
                name="diet_preference"
                value={form.diet_preference}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2"
              >
                <option value="">Diet Preference</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>



              <select
                name="physical_activity"
                value={form.physical_activity}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2"
              >
                <option value="">Physical Activity</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>

              {/* Chronic Diseases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chronic Diseases
                </label>
                <input
                  type="text"
                  name="chronic_diseases"
                  value={form.chronic_diseases}
                  onChange={handleChange}
                  placeholder="Ex: Diabetes, Hypertension"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  name="medical_history"
                  value={form.medical_history}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Past surgeries or major illnesses"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Medications
                </label>
                <input
                  type="text"
                  name="current_medications"
                  value={form.current_medications}
                  onChange={handleChange}
                  placeholder="List current prescriptions"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Food or drug allergies"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSubmit}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-blue-700 transition"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>

  );
}
