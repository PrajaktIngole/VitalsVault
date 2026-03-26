import express from "express";
import pool from "../config/db.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeDoctor } from "../middleware/role.middleware.js";

import {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile, // ✅ ADD THIS
} from "../controllers/doctorProfile.controller.js";

import {
  getPatientNotesForDoctor,
  addDoctorComment,
} from "../controllers/doctorNotes.controller.js";

const router = express.Router();

// ===============================
// GET patient by patient_uid
// ===============================
router.get(
  "/patient/:patient_uid",
  authenticate,
  authorizeDoctor,
  async (req, res) => {
    const { patient_uid } = req.params;

    try {
      const result = await pool.query(
        `SELECT 
           p.patient_uid,
           u.name,
           u.email,
           p.age,
           p.gender,
           p.chronic_diseases,
           p.medical_history,
           p.current_medications,
           p.allergies
         FROM patients p
         JOIN users u ON u.id = p.user_id
         WHERE p.patient_uid = $1`,
        [patient_uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// DOCTOR PROFILE ROUTES
// ===============================

// ✅ get doctor profile
router.get(
  "/profile",
  authenticate,
  authorizeDoctor,
  getDoctorProfile
);

// ✅ create doctor profile
router.post(
  "/profile",
  authenticate,
  authorizeDoctor,
  createDoctorProfile
);

// ✅ UPDATE doctor profile (🔥 NEW)
router.put(
  "/profile",
  authenticate,
  authorizeDoctor,
  updateDoctorProfile
);

// ===============================
// DOCTOR NOTES
// ===============================

// ✅ doctor views patient notes
router.get(
  "/patient/:patient_uid/notes",
  authenticate,
  authorizeDoctor,
  getPatientNotesForDoctor
);

// ✅ doctor adds comment to note
router.put(
  "/notes/:noteId/comment",
  authenticate,
  authorizeDoctor,
  addDoctorComment
);

export default router;
