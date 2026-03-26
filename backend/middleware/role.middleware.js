export const authorizeDoctor = (req, res, next) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({ message: "Doctor access only" });
  }
  next();
};

export const authorizePatient = (req, res, next) => {
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
