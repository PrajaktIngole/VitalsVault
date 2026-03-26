import express from "express";
import {
  addVitals,
  getMyVitals,
  getPatientVitalsForDoctor,
  updateVitals,
  deleteVitals,
  getDoctorPatientsVitals,
} from "../controllers/vitals.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  authorizePatient,
  authorizeDoctor,
} from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  authorizePatient,
  getMyVitals
);

// Patient
router.post("/", authenticate, authorizePatient, addVitals);
router.get("/", authenticate, authorizePatient, getMyVitals);


// Doctor - all patients vitals
router.get(
  "/doctor",
  authenticate,
  authorizeDoctor,
  getDoctorPatientsVitals
);


// Doctor
router.get(
  "/doctor/:patientUid",
  authenticate,
  authorizeDoctor,
  getPatientVitalsForDoctor
);



router.put("/:id", authenticate, authorizePatient, updateVitals);
router.delete("/:id", authenticate, authorizePatient, deleteVitals);


export default router;
