import multer from "multer";

// Use memory storage to prevent Vercel read-only filesystem crash
const storage = multer.memoryStorage();

// File filter (jpg, png, pdf)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF allowed"), false);
  }
};

export const uploadPrescription = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
