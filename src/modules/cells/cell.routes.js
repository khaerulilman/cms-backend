import { Router } from "express";
import multer from "multer";
import path from "path";
import CellController from "./cell.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new CellController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// All routes require authentication
router.use(authMiddleware);

// Get all cells for a specific row
router.get("/row/:rowId", (req, res, next) =>
  controller.getCellsByRow(req, res, next)
);

// Get specific cell by ID
router.get("/:cellId", (req, res, next) =>
  controller.getCellById(req, res, next)
);

// Upsert cell (update if exists, create if not) - with optional image upload
router.post("/row/:rowId", upload.single("image"), (req, res, next) =>
  controller.upsertCell(req, res, next)
);

// Delete cell
router.delete("/:cellId", (req, res, next) =>
  controller.deleteCell(req, res, next)
);

export default router;
