import express from "express";
import pool from "../config/db.js"; // make sure db file also uses export default
const router = express.Router();

import fetch from "node-fetch";

// Calculate BMI
function calculateBMI(height_cm, weight_kg) {
  const height_m = height_cm / 100;
  return (weight_kg / (height_m * height_m)).toFixed(2);
}

// BMI Category
function getCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Health Score
function calculateHealthScore(bmi) {
  const ideal = 22;
  const deviation = Math.abs(bmi - ideal);
  let score = 100 - deviation * 5;
  return score < 50 ? 50 : Math.round(score);
}

//  HypertensionRisk
async function getHypertensionRisk(data) {
  try {
    console.log("Calling ML (Hypertension):", process.env.ML_API_URL);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 sec

    const response = await fetch(
      `${process.env.ML_API_URL}/predict/hypertension`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    return await response.json();
  } catch (error) {
    console.error("ML API Error:", error.message);
    return { risk: "Unknown", probability: 0 };
  }
}

async function getDiabetesRisk(data) {
  try {
    console.log("Calling ML (Diabetes):", process.env.ML_API_URL);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${process.env.ML_API_URL}/predict/diabetes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      console.error("Diabetes ML API error:", response.status, text);
      return { risk: "Unknown", probability: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error("Diabetes ML API Error:", error.message);
    return { risk: "Unknown", probability: 0 };
  }
}

router.post("/analyze", async (req, res) => {
  try {
    const {
      patient_id,
      height_cm,
      weight_kg,
      age,
      sugar,
      activity_level,
      family_history,
    } = req.body;

    const patientIdNum = Number(patient_id);
    const heightNum = Number(height_cm);
    const weightNum = Number(weight_kg);
    const ageNum = Number(age);
    const sugarNum = Number(sugar);
    const activityNum = Number(activity_level);
    const familyHistoryNum = Number(family_history);

    const bmi = parseFloat(calculateBMI(heightNum, weightNum));
    const category = getCategory(bmi);
    const healthScore = Number(calculateHealthScore(bmi));

    const diabetesRisk = await getDiabetesRisk({
      age: ageNum,
      bmi: bmi,
      sugar: sugarNum,
      activity_level: activityNum,
      family_history: familyHistoryNum,
    });
    // 🔥 Fetch latest BP
    const vitalsResult = await pool.query(
      `SELECT systolic, diastolic
       FROM vitals
       WHERE patient_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [patientIdNum],
    );

    if (vitalsResult.rows.length === 0) {
      return res.status(400).json({
        error: "No vitals found for this patient.",
      });
    }

    const { systolic, diastolic } = vitalsResult.rows[0];

    console.log("Fetched Vitals:", vitalsResult.rows[0]);

    console.log("Sending to ML:", {
      age: ageNum,
      bmi: bmi,
      systolic,
      diastolic,
    });

    // 🔥 Call ML with REAL BP
    const riskResult = await getHypertensionRisk({
      age: ageNum,
      bmi: bmi,
      systolic: systolic,
      diastolic: diastolic,
    });

    const result = await pool.query(
      `INSERT INTO fitness_profile
(patient_id, height_cm, weight_kg, age, bmi, bmi_category, health_score,
 hypertension_risk, risk_probability,
 diabetes_risk, diabetes_probability)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
RETURNING *`,
      [
        patient_id,
        height_cm,
        weight_kg,
        age,
        bmi,
        category,
        healthScore,
        riskResult.risk,
        riskResult.probability,
        diabetesRisk.risk,
        diabetesRisk.probability,
      ],
    );

    res.json({
      success: true,
      data: result.rows[0],
      hypertensionRisk: riskResult,
      diabetesRisk: diabetesRisk,
    });
  } catch (error) {
    console.error("ANALYZE Endpoint Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.get("/latest/:patient_id", async (req, res) => {
  try {
    const { patient_id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM fitness_profile
       WHERE patient_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [patient_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No fitness record found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
