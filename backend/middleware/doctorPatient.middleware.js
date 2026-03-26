import pool from "../config/db.js";

export const checkDoctorPatientAccess = async (req, res, next) => {
  try {
    const userId = req.user.id; // users.id
    const { patientUid } = req.params;

    // 1️⃣ Get doctor.id from user.id
    const doctorRes = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (doctorRes.rows.length === 0) {
      return res.status(403).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorRes.rows[0].id;

    // 2️⃣ Get patient.id
    const patientRes = await pool.query(
      "SELECT id FROM patients WHERE patient_uid = $1",
      [patientUid]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientRes.rows[0].id;

    // 3️⃣ Check mapping
    const linkRes = await pool.query(
      "SELECT 1 FROM doctor_patients WHERE doctor_id = $1 AND patient_id = $2",
      [doctorId, patientId]
    );

    if (linkRes.rows.length === 0) {
      return res.status(403).json({ message: "Patient not added to your list" });
    }

    req.patientId = patientId;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Access check failed" });
  }
};

