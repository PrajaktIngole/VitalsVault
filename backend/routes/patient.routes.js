import express from "express";
import {
  addPatientNote,
  updatePatientNote,
  deletePatientNote,
  getMyNotes
} from "../controllers/patientNote.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizePatient } from "../middleware/role.middleware.js";
import {
  getPatientProfile,
  createPatientProfile,
  updateBMI,
} from "../controllers/patient.controller.js";
import { updatePatientProfile } from "../controllers/patient.controller.js";


const router = express.Router();

router.post(
  "/note",
  authenticate,
  authorizePatient,
  addPatientNote
);

router.get(
  "/notes",
  authenticate,
  authorizePatient,
  getMyNotes
);

router.put(
  "/note/:id",
  authenticate,
  authorizePatient,
  updatePatientNote
);

router.delete(
  "/note/:id",
  authenticate,
  authorizePatient,
  deletePatientNote
);
// ✅ check if patient profile exists
router.get(
  "/profile",
  authenticate,
  authorizePatient,
  getPatientProfile
);

// ✅ create patient profile
router.post(
  "/profile",
  authenticate,
  authorizePatient,
  createPatientProfile
);

router.put(
  "/bmi",
  authenticate,
  authorizePatient,
  updateBMI
);

router.put(
  "/profile",
  authenticate,
  authorizePatient,
  updatePatientProfile
);










export default router;
