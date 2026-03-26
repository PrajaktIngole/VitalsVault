"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";


type DoctorProfile = {
  name: string;
  education: string;
  specialization: string;
  experience_years: number;
  hospital_name: string;
  registration_number: string;
  online_fee: number;
  clinic_fee: number;
};
;

export default function DoctorProfileView() {
  // const [profile, setProfile] = useState<DoctorProfile | null>(null);
  // const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const router = useRouter();



  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setProfile(data.profile);
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          // profile does NOT exist
          setProfileExists(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data);
        setProfileExists(true);

        setLoading(false);
      })
      .catch(() => {
        setProfileExists(false);
        setLoading(false);
      });
  }, []);


  return (
    <ProtectedRoute role="DOCTOR">
      <Navbar />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">

          <div>
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-black text-slate-900 tracking-tight">
              My Professional Profile
            </h2>

            <p className="text-sm text-gray-500">
              Manage your public credentials and clinic details.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 w-full sm:w-auto"
              onClick={() => router.push("/doctor/profile?mode=edit")}
            >
              Edit Profile
            </button>

          </div>

        </div>


        {loading && (
          <p className="text-gray-700">Loading profile...</p>
        )}


        {/* VIEW PROFILE */}
        {!loading && profileExists === true && profile && (

          <div className="bg-white rounded-2xl shadow overflow-hidden">

            {/* HERO SECTION */}

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white text-blue-600 flex items-center justify-center text-lg sm:text-xl font-bold shadow">

                  {profile.name
                    ? profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                    : "DR"}

                </div>


                <div className="text-white">

                  <h3 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">

                    Dr. {profile.name}

                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      VERIFIED
                    </span>

                  </h3>

                  <p className="text-sm opacity-90">
                    {profile.specialization}
                  </p>

                </div>

              </div>

            </div>


            {/* PROFILE INFO */}

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

              {/* Registration Number */}

              {/* <div className="bg-white rounded-xl shadow p-4 sm:p-6">

                <p className="text-sm text-gray-500 mb-1">
                  Medical Registration No.
                </p>

                <p className="font-semibold text-gray-900 break-words">
                  {profile.registration_number || "—"}
                </p>

              </div> */}


              {/* Fees */}

              {/* <div className="bg-white rounded-xl shadow p-4 sm:p-6">

                <h4 className="font-semibold text-gray-900 mb-3">
                  💰 Consultation Fees
                </h4>

                <div className="space-y-2 text-gray-700 text-sm sm:text-base">

                  <p>💻 Online: ₹{profile.online_fee ?? "—"}</p>

                  <p>🏥 Clinic: ₹{profile.clinic_fee ?? "—"}</p>

                </div>

              </div> */}


              {/* Info Cards */}

              <InfoCard title="Education" value={profile.education} />

              <InfoCard title="Specialization" value={profile.specialization} />

              <InfoCard
                title="Experience"
                value={`${profile.experience_years} Years`}
              />

              <InfoCard
                title="Hospital / Clinic"
                value={profile.hospital_name}
              />

            </div>

          </div>

        )}

      </div>


    </ProtectedRoute>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <p className="text-sm text-gray-500 font-semibold mb-1">
        {title}
      </p>
      <p className="text-lg font-bold text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}

// function CreateDoctorProfileForm() {
//   const [form, setForm] = useState({
//     education: "",
//     specialization: "",
//     experience_years: "",
//     hospital_name: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     const token = localStorage.getItem("token");

//     await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/doctor/profile`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         education: form.education,
//         specialization: form.specialization,
//         experience_years: Number(form.experience_years),
//         hospital_name: form.hospital_name,
//       }),
//     });

//     // reload page to fetch profile again
//     window.location.reload();
//   };

//   return (
//     <div className="max-w-md bg-white p-6 rounded-xl shadow">
//       <h2 className="text-xl font-bold mb-4">
//         Complete Doctor Profile
//       </h2>

//       <input
//         name="education"
//         placeholder="Education"
//         onChange={handleChange}
//         className="w-full border px-3 py-2 rounded mb-3"
//       />

//       <input
//         name="specialization"
//         placeholder="Specialization"
//         onChange={handleChange}
//         className="w-full border px-3 py-2 rounded mb-3"
//       />

//       <input
//         name="experience_years"
//         type="number"
//         placeholder="Years of Experience"
//         onChange={handleChange}
//         className="w-full border px-3 py-2 rounded mb-3"
//       />

//       <input
//         name="hospital_name"
//         placeholder="Hospital / Clinic"
//         onChange={handleChange}
//         className="w-full border px-3 py-2 rounded mb-4"
//       />

//       <button
//         onClick={handleSubmit}
//         className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
//       >
//         Save Profile
//       </button>
//     </div>
//   );
// }

