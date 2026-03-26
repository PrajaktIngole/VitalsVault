import pool from "../config/db.js";

export const getPatientNotesForDoctor = async (req, res) => {
  const { patient_uid } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        pn.id,
        pn.note,
        pn.medications_taken,
        pn.doctor_comment,   -- ✅ THIS WAS MISSING
        pn.created_at
      FROM patient_notes pn
      JOIN patients p ON pn.patient_id = p.id
      WHERE p.patient_uid = $1
      ORDER BY pn.created_at DESC
      `,
      [patient_uid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Doctor get notes error:", error);
    res.status(500).json({ message: "Failed to fetch patient notes" });
  }
};



export const addDoctorComment = async (req, res) => {
  const { noteId } = req.params;
  const { doctor_comment } = req.body;

  try {
    await pool.query(
      `
      UPDATE patient_notes
      SET doctor_comment = $1
      WHERE id = $2
      `,
      [doctor_comment, noteId]
    );

    res.status(200).json({ message: "Doctor comment added" });
  } catch (error) {
    console.error("Add doctor comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

