import pool from "../config/db.js";

// PATIENT → add prescription (file logic later)
export const addPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      prescription_date,
      disease,
      doctor_name,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    // Get patient id
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientResult.rows[0].id;

    // Convert buffer to base64 string
    const fileBase64 = Buffer.from(req.file.buffer).toString("base64");
    const fileUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

    await pool.query(
      `INSERT INTO prescriptions 
       (patient_id, prescription_date, disease, doctor_name, file_url, file_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        patientId,
        prescription_date,
        disease,
        doctor_name,
        fileUrl,
        req.file.mimetype,
      ]
    );

    res.status(201).json({ message: "Prescription added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATIENT → get own prescriptions
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    // get patient id
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientResult.rows[0].id;

    const result = await pool.query(
      `SELECT 
        id,
        prescription_date,
        disease,
        doctor_name,
        file_url,
        file_type,
        created_at
       FROM prescriptions
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATIENT → update prescription
export const updatePrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { prescription_date, disease, doctor_name } = req.body;

    // get patient id
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientResult.rows[0].id;

    // update only if prescription belongs to patient
    const result = await pool.query(
      `UPDATE prescriptions
       SET prescription_date = $1,
           disease = $2,
           doctor_name = $3
       WHERE id = $4 AND patient_id = $5
       RETURNING *`,
      [prescription_date, disease, doctor_name, id, patientId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Prescription not found or not allowed" });
    }

    res.json({ message: "Prescription updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATIENT → delete prescription
export const deletePrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // get patient id
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientResult.rows[0].id;

    const result = await pool.query(
      "DELETE FROM prescriptions WHERE id = $1 AND patient_id = $2",
      [id, patientId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Prescription not found or not allowed" });
    }

    res.json({ message: "Prescription deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DOCTOR → view patient prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patient_uid } = req.params;

    // Get patient ID using patient_uid
    const patientResult = await pool.query(
      "SELECT id FROM patients WHERE patient_uid = $1",
      [patient_uid]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patientResult.rows[0].id;

    // Fetch prescriptions
    const result = await pool.query(
      `SELECT 
        id,
        prescription_date,
        disease,
        doctor_name,
        file_url,
        file_type,
        created_at
       FROM prescriptions
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
