import pool from "../config/db.js";

// ✅ Patient adds vitals
export const addVitals = async (req, res) => {
  try {
    const userId = req.user.id;

    const patientRes = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientRes.rows.length === 0) {
      return res.status(400).json({ message: "Patient profile not found" });
    }

    const patientId = patientRes.rows[0].id;

    const { systolic, diastolic, heart_rate, spo2, sugar_mg } = req.body;

    const result = await pool.query(
      `
      INSERT INTO vitals
      (patient_id, systolic, diastolic, heart_rate, spo2, sugar_mg, recorded_by, recorded_date)
      VALUES ($1, $2, $3, $4, $5, $6, 'PATIENT', CURRENT_DATE)
      RETURNING *
      `,
      [patientId, systolic, diastolic, heart_rate, spo2, sugar_mg]
    );

    res.status(201).json({ vitals: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add vitals" });
  }
};

// ✅ Patient views own vitals (day-wise)
export const getMyVitals = async (req, res) => {
  try {
    const userId = req.user.id;

    // get patient id from user
    const patientRes = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientRes.rows[0].id;

    const vitalsRes = await pool.query(
      `
      SELECT *
      FROM vitals
      WHERE patient_id = $1
      ORDER BY recorded_date DESC, recorded_at DESC
      `,
      [patientId]
    );

    res.json(vitalsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vitals" });
  }
};

// ✅ Doctor views patient vitals
export const getPatientVitalsForDoctor = async (req, res) => {
  try {
    const { patientUid } = req.params;

    const patient = await pool.query(
      "SELECT id FROM patients WHERE patient_uid = $1",
      [patientUid]
    );

    if (patient.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const vitals = await pool.query(
      `
      SELECT *
      FROM vitals
      WHERE patient_id = $1
      ORDER BY recorded_date ASC
      `,
      [patient.rows[0].id]
    );

    res.json(vitals.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vitals" });
  }
};

/* ================= UPDATE VITALS ================= */
export const updateVitals = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 Resolve patient_id properly
    const patientRes = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [req.user.id]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patientRes.rows[0].id;

    const { systolic, diastolic, heart_rate, spo2, sugar_mg } = req.body;

    const result = await pool.query(
      `UPDATE vitals SET
        systolic=$1,
        diastolic=$2,
        heart_rate=$3,
        spo2=$4,
        sugar_mg=$5
       WHERE id=$6 AND patient_id=$7
       RETURNING *`,
      [systolic, diastolic, heart_rate, spo2, sugar_mg, id, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vitals not found" });
    }

    res.json({ vitals: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update vitals" });
  }
};

/* ================= DELETE VITALS ================= */
export const deleteVitals = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 Resolve patient_id from user_id
    const patientRes = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [req.user.id]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patientRes.rows[0].id;

    // 🗑 Delete vitals (ownership enforced)
    const result = await pool.query(
      "DELETE FROM vitals WHERE id = $1 AND patient_id = $2 RETURNING *",
      [id, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vitals not found" });
    }

    res.json({
      message: "Vitals deleted successfully",
      vitals: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete vitals" });
  }
};

export const getVitalsForDoctor = async (req, res) => {
  try {
    // set by doctorPatient.middleware.js
    const patientId = req.patientId;

    const result = await pool.query(
      `
      SELECT 
        id,
        systolic,
        diastolic,
        heart_rate,
        spo2,
        sugar_mg,
        recorded_at
      FROM vitals
      WHERE patient_id = $1
      ORDER BY recorded_at ASC
      `,
      [patientId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patient vitals" });
  }
};

export const getDoctorPatientsVitals = async (req, res) => {
  try {
    const doctorUserId = req.user.id;

    // 1️⃣ Get doctor id from user_id
    const doctorRes = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [doctorUserId]
    );

    if (doctorRes.rows.length === 0) {
      return res.json([]); // no doctor profile
    }

    const doctorId = doctorRes.rows[0].id;

    // 2️⃣ Get vitals ONLY for doctor's patients
    const vitalsResult = await pool.query(
      `
      SELECT v.*
      FROM vitals v
      JOIN doctor_patients dp ON v.patient_id = dp.patient_id
      WHERE dp.doctor_id = $1
      ORDER BY v.recorded_at DESC
      `,
      [doctorId]
    );

    res.json(vitalsResult.rows);
  } catch (error) {
    console.error("Doctor patients vitals error:", error);
    res.status(500).json([]);
  }
};






