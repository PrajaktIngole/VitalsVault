import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import doctorPatientRoutes from "./routes/doctorPatient.routes.js";
import vitalsRoutes from "./routes/vitals.routes.js";
import fitnessRoutes from "./routes/fitness.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/doctor/patients", doctorPatientRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/fitness", fitnessRoutes);

app.get("/", (req, res) => {
  res.send("Vitals Vault API Running 🚀");
});
pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.error("DB connection failed ❌", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
