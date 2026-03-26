import pool from "../config/db.js";

// 1️⃣ Add patient to doctor's list
export const addDoctorPatient = async (req, res) => {
  try {
    const doctorUserId = req.user.id;
    const { patient_uid } = req.body;

    // get doctor id
    const doctorResult = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [doctorUserId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // get patient id
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE patient_uid = $1",
      [patient_uid]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // insert mapping
    await pool.query(
      `INSERT INTO doctor_patients (doctor_id, patient_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [doctorResult.rows[0].id, patientResult.rows[0].id]
    );

    res.json({ message: "Patient added to doctor list" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Get doctor's saved patients
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorUserId = req.user.id;

    const result = await pool.query(
      `SELECT
        p.id AS patient_id, 
        p.patient_uid,
        u.name,
        p.age,
        p.gender
       FROM doctor_patients dp
       JOIN doctors d ON dp.doctor_id = d.id
       JOIN patients p ON dp.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE d.user_id = $1`,
      [doctorUserId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Remove patient from doctor's list
export const removeDoctorPatient = async (req, res) => {
  try {
    const doctorUserId = req.user.id;
    const { patient_uid } = req.params;

    await pool.query(
      `DELETE FROM doctor_patients
       WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = $1)
       AND patient_id = (SELECT id FROM patients WHERE patient_uid = $2)`,
      [doctorUserId, patient_uid]
    );

    res.json({ message: "Patient removed from doctor list" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatientVitalsForDoctor = async (req, res) => {
  try {
    // patientId already validated & injected by middleware
    const patientId = req.patientId;

    const vitals = await pool.query(
      `SELECT *
       FROM vitals
       WHERE patient_id = $1
       ORDER BY recorded_at DESC`,
      [patientId]
    );

    res.json(vitals.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vitals" });
  }
};

// export const getDoctorPatientDetails = async (req, res) => {
//   try {
//     const patientId = req.patientId; // from middleware

//     const result = await pool.query(
//       `SELECT 
//         p.patient_uid,
//         u.name,
//         u.email,
//         p.age,
//         p.gender,
//         p.chronic_diseases,
//         p.medical_history,
//         p.current_medications,
//         p.allergies
//        FROM patients p
//        JOIN users u ON p.user_id = u.id
//        WHERE p.id = $1`,
//       [patientId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch patient details" });
//   }
// };


export const getDoctorPatientDetails = async (req, res) => {
  try {
    const patientId = req.patientId; // from middleware

    const result = await pool.query(
      `SELECT 
        p.patient_uid,
        u.name,
        u.email,
        p.age,
        p.gender,
        p.blood_group,

        -- BMI data
        p.height_cm,
        p.weight_kg,

        -- Medical info
        p.chronic_diseases,
        p.medical_history,
        p.current_medications,
        p.allergies,

        -- Lifestyle
        p.smoking,
        p.alcohol,
        p.diet_preference,
        p.physical_activity
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const profile = result.rows[0];

    // ✅ BMI calculation (same logic as patient side)
    let bmi = null;
    let bmi_category = null;

    if (profile.height_cm && profile.weight_kg) {
      const h = profile.height_cm / 100;
      bmi = (profile.weight_kg / (h * h)).toFixed(1);

      if (bmi < 18.5) bmi_category = "Underweight";
      else if (bmi < 25) bmi_category = "Normal";
      else if (bmi < 30) bmi_category = "Overweight";
      else bmi_category = "Obese";
    }

    res.json({
      ...profile,
      bmi,
      bmi_category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
};

