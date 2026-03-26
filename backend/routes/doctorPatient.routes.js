import express from "express";
import {
  addDoctorPatient,
  getDoctorPatients,
  removeDoctorPatient,
} from "../controllers/doctorPatient.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeDoctor } from "../middleware/role.middleware.js";

import { getPatientVitalsForDoctor } from "../controllers/vitals.controller.js";
import { checkDoctorPatientAccess } from "../middleware/doctorPatient.middleware.js";
import { getDoctorPatientDetails } from "../controllers/doctorPatient.controller.js";


const router = express.Router();

// Add patient
router.post("/", authenticate, authorizeDoctor, addDoctorPatient);

// Get all patients of doctor
router.get("/", authenticate, authorizeDoctor, getDoctorPatients);

// Remove patient
router.delete(
  "/:patient_uid",
  authenticate,
  authorizeDoctor,
  removeDoctorPatient
);

router.get(
  "/:patientUid",
  authenticate,
  authorizeDoctor,
  checkDoctorPatientAccess,
  getDoctorPatientDetails
);


router.get(
  "/:patientUid/vitals",
  authenticate,
  authorizeDoctor,
  checkDoctorPatientAccess,
  getPatientVitalsForDoctor
);





export default router;
