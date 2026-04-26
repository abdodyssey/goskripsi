import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // In-memory buffer for small files

/**
 * Route: POST /api/upload
 * Secured by token verification. Handles multipart form-data.
 */
router.post(
  "/",
  requireAuth,
  upload.single("file"), // Key must be 'file'
  uploadController.uploadFile,
);

/**
 * Route: POST /api/upload/signed-url
 * Secured via backend-to-backend createSignedUrl call.
 */
router.post("/signed-url", requireAuth, uploadController.getSignedUrl);

export default router;
