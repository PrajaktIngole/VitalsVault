import express from "express";
import {
  addPrescription,
  getMyPrescriptions,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
} from "../controllers/prescription.controller.js";
import { uploadPrescription } from "../middleware/upload.middleware.js";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  authorizePatient,
  authorizeDoctor,
} from "../middleware/role.middleware.js";

const router = express.Router();

// ================= PATIENT =================
router.post(
  "/",
  authenticate,
  authorizePatient,
  uploadPrescription.single("file"),
  addPrescription
);

router.get("/", authenticate, authorizePatient, getMyPrescriptions);
router.put("/:id", authenticate, authorizePatient, updatePrescription);
router.delete("/:id", authenticate, authorizePatient, deletePrescription);

// ================= DOCTOR =================
router.get(
  "/doctor/:patient_uid",
  authenticate,
  authorizeDoctor,
  getPatientPrescriptions
);

export default router;
