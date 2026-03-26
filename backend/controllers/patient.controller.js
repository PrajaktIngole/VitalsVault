import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.patient_uid,
        u.name,
        p.age,
        p.gender,
        p.blood_group,
        p.smoking,
        p.alcohol,
        p.diet_preference,
        p.physical_activity,
        p.height_cm,
        p.weight_kg,
        p.chronic_diseases,
        p.medical_history,
        p.current_medications,
        p.allergies
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ profile: null });
    }

    const profile = result.rows[0];

    // ✅ BMI calculation
    let bmi = null;
    let bmi_category = null;

    if (profile.height_cm && profile.weight_kg) {
      const heightInMeters = profile.height_cm / 100;
      bmi = (profile.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);

      // ✅ BMI category
      if (bmi < 18.5) bmi_category = "Underweight";
      else if (bmi < 25) bmi_category = "Normal";
      else if (bmi < 30) bmi_category = "Overweight";
      else bmi_category = "Obese";
    }

    res.json({
      exists: true,
      profile: {
        ...profile,
        bmi,
        bmi_category,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient profile" });
  }
};

export const createPatientProfile = async (req, res) => {
  console.log("BODY:", req.body);
  const user_id = req.user.id;
  const {
    age,
    gender,
    blood_group,
    smoking,
    alcohol,
    diet_preference,
    physical_activity,
    height_cm,
    weight_kg,
    chronic_diseases,
    medical_history,
    current_medications,
    allergies,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO patients
      (
        user_id,
        age,
        gender,
        blood_group,
        smoking,
        alcohol,
        diet_preference,
        physical_activity,
        height_cm,
        weight_kg,
        chronic_diseases,
        medical_history,
        current_medications,
        allergies,
        patient_uid
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,

      [
        user_id,
        age,
        gender,
        blood_group,
        smoking,
        alcohol,
        diet_preference,
        physical_activity,
        height_cm,
        weight_kg,
        chronic_diseases,
        medical_history,
        current_medications,
        allergies,
        "PAT-" + uuidv4().slice(0, 8),
      ],
    );

    res.status(201).json({ message: "Patient profile created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBMI = async (req, res) => {
  const { height_cm, weight_kg } = req.body;

  try {
    await pool.query(
      `
      UPDATE patients
      SET height_cm = $1,
          weight_kg = $2
      WHERE user_id = $3
      `,
      [height_cm, weight_kg, req.user.id],
    );

    res.json({ message: "Height & weight updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update BMI data" });
  }
};

export const updatePatientProfile = async (req, res) => {
  const user_id = req.user.id;

  const {
    age,
    gender,
    blood_group,
    smoking,
    alcohol,
    diet_preference,
    physical_activity,
    chronic_diseases,
    medical_history,
    current_medications,
    allergies,
  } = req.body;

  try {
    await pool.query(
      `
      UPDATE patients
      SET
        age = $1,
        gender = $2,
        blood_group = $3,
        smoking = $4,
        alcohol = $5,
        diet_preference = $6,
        physical_activity = $7,
        chronic_diseases = $8,
        medical_history = $9,
        current_medications = $10,
        allergies = $11
      WHERE user_id = $12
      `,
      [
        age,
        gender,
        blood_group,
        smoking,
        alcohol,
        diet_preference,
        physical_activity,
        chronic_diseases,
        medical_history,
        current_medications,
        allergies,
        user_id,
      ],
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
