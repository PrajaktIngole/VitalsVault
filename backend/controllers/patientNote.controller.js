import pool from "../config/db.js";

// helper: get patient_id from logged-in user
const getPatientIdFromUser = async (user_id) => {
  const result = await pool.query(
    "SELECT id FROM patients WHERE user_id = $1",
    [user_id]
  );
  return result.rows[0]?.id;
};

// ✅ ADD NOTE
export const addPatientNote = async (req, res) => {
  const { note, medications_taken } = req.body;
  const user_id = req.user.id;

  try {
    const patient_id = await getPatientIdFromUser(user_id);
    if (!patient_id) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    await pool.query(
      `INSERT INTO patient_notes (patient_id, note, medications_taken)
       VALUES ($1, $2, $3)`,
      [patient_id, note, medications_taken]
    );

    res.status(201).json({ message: "Patient note added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET MY NOTES
// export const getMyNotes = async (req, res) => {
//   const user_id = req.user.id;

//   try {
//     const patient_id = await getPatientIdFromUser(user_id);
//     if (!patient_id) {
//       return res.status(404).json({ message: "Patient profile not found" });
//     }

//     const notes = await pool.query(
//       `SELECT id, note, medications_taken, created_at
//        FROM patient_notes
//        WHERE patient_id = $1
//        ORDER BY created_at DESC`,
//       [patient_id]
//     );

//     res.json(notes.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// ✅ GET MY NOTES (Patient can see doctor comment)
export const getMyNotes = async (req, res) => {
  const user_id = req.user.id;

  try {
    const patient_id = await getPatientIdFromUser(user_id);
    if (!patient_id) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const notes = await pool.query(
      `
      SELECT
        id,
        note,
        medications_taken,
        doctor_comment,   -- ✅ ADD THIS
        created_at
      FROM patient_notes
      WHERE patient_id = $1
      ORDER BY created_at DESC
      `,
      [patient_id]
    );

    res.json(notes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ UPDATE NOTE
export const updatePatientNote = async (req, res) => {
  const { id } = req.params;
  const { note, medications_taken } = req.body;
  const user_id = req.user.id;

  try {
    const patient_id = await getPatientIdFromUser(user_id);
    if (!patient_id) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const result = await pool.query(
      `UPDATE patient_notes
       SET note = $1, medications_taken = $2
       WHERE id = $3 AND patient_id = $4`,
      [note, medications_taken, id, patient_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE NOTE
export const deletePatientNote = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const patient_id = await getPatientIdFromUser(user_id);
    if (!patient_id) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const result = await pool.query(
      `DELETE FROM patient_notes
       WHERE id = $1 AND patient_id = $2`,
      [id, patient_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
