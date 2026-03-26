import pool from "../config/db.js";

// export const getDoctorProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const result = await pool.query(
//       `
//       SELECT
//         u.name,
//         d.education,
//         d.specialization,
//         d.experience_years,
//         d.hospital_name
//       FROM doctors d
//       JOIN users u ON d.user_id = u.id
//       WHERE d.user_id = $1
//       `,
//       [userId]
//     );

//     res.json({ profile: result.rows[0] });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch profile" });
//   }
// };



export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT

    const result = await pool.query(
      `
      SELECT
        d.user_id,
        u.name,
        u.email,
        d.registration_number,
        d.education,
        d.specialization,
        d.experience_years,
        d.hospital_name,
        d.online_fee,
        d.clinic_fee
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      WHERE d.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({
      message: "Failed to fetch doctor profile",
    });
  }
};



// ✅ create doctor profile
export const createDoctorProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    education,
    specialization,
    experience_years,
    hospital_name,
    registration_number,
    online_fee,
    clinic_fee,
  } = req.body;

  try {
    const existing = await pool.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Doctor profile already exists",
      });
    }

    await pool.query(
      `
      INSERT INTO doctors
      (
        user_id,
        education,
        specialization,
        experience_years,
        hospital_name,
        registration_number,
        online_fee,
        clinic_fee
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        userId,
        education,
        specialization,
        experience_years,
        hospital_name,
        registration_number,
        online_fee,
        clinic_fee,
      ]
    );

    res.status(201).json({ message: "Doctor profile created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create doctor profile" });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log("Updating profile for doctor:", doctorId);

    const {
      education,
      specialization,
      experience_years,
      hospital_name,
      online_fee,
      clinic_fee,
    } = req.body;

    // ✅ FIX: handle empty strings for integers
    const expYears = experience_years === "" ? null : Number(experience_years);
    const onlineFee = online_fee === "" ? null : Number(online_fee);
    const clinicFee = clinic_fee === "" ? null : Number(clinic_fee);

    const result = await pool.query(
      `
      UPDATE doctors
      SET
        education = $1,
        specialization = $2,
        experience_years = $3,
        hospital_name = $4,
        online_fee = $5,
        clinic_fee = $6
      WHERE user_id = $7
      RETURNING *
      `,
      [
        education,
        specialization,
        expYears,
        hospital_name,
        onlineFee,
        clinicFee,
        doctorId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Update doctor profile error:", error);
    return res.status(500).json({
      message: "Internal server error while updating doctor profile",
    });
  }
};
