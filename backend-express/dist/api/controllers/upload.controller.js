"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const supabase_1 = require("../../utils/supabase");
const path_1 = __importDefault(require("path"));
/**
 * Controller specifically for handling Secure File Uploads to Supabase Storage
 */
class UploadController {
    async uploadFile(req, res, next) {
        try {
            const file = req.file;
            const { type, owner_id } = req.body; // 'signature' or 'submission'
            const user = req.user;
            if (!file) {
                return res
                    .status(400)
                    .json({ message: "No file provided", success: false });
            }
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Unauthorized Session", success: false });
            }
            // 1. MIME Validation
            const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    message: "Invalid file type. Only PNG, JPEG, and PDF are allowed.",
                    success: false,
                });
            }
            // 2. Build Path & Policy Enforcement
            let storagePath = "";
            const bucket = "skripsi_docs";
            if (type === "signature") {
                const isStudent = user.roles.includes("mahasiswa");
                const nipOrNim = owner_id || user.nip_nim;
                if (isStudent) {
                    // Student Path: skripsi_docs/signatures/students/{{nim}}/ttd_mahasiswa.png
                    storagePath = `signatures/students/${nipOrNim}/ttd_mahasiswa${path_1.default.extname(file.originalname)}`;
                }
                else {
                    // Lecturer Path: skripsi_docs/signatures/{{nip}}/ttd_official.png
                    storagePath = `signatures/${nipOrNim}/ttd_official${path_1.default.extname(file.originalname)}`;
                }
            }
            else if (type === "submission") {
                // Path: skripsi_docs/submissions/{{nim_mahasiswa}}/{{file_name}}.pdf
                const nim = owner_id || user.nip_nim;
                const sanitizedFilename = file.originalname
                    .replace(/[^a-z0-9.]/gi, "_")
                    .toLowerCase();
                storagePath = `submissions/${nim}/${sanitizedFilename}`;
            }
            else {
                return res
                    .status(400)
                    .json({ message: "Invalid upload type", success: false });
            }
            // 3. Upload via service_role to bypass RLS, but we've validated the session above
            const { data, error } = await supabase_1.supabaseAdmin.storage
                .from(bucket)
                .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true, // Required for updating signatures
            });
            if (error) {
                throw error;
            }
            // 4. Return success metadata
            res.status(200).json({
                message: "File uploaded successfully",
                success: true,
                data: {
                    path: data.path,
                    fullUrl: `${process.env.SUPABASE_URL}/storage/v1/object/authenticated/${bucket}/${data.path}`,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getSignedUrl(req, res, next) {
        try {
            const { path } = req.body;
            const bucket = "skripsi_docs";
            if (!path) {
                return res
                    .status(400)
                    .json({ message: "Path is required", success: false });
            }
            const { data, error } = await supabase_1.supabaseAdmin.storage
                .from(bucket)
                .createSignedUrl(path, 60); // 60 seconds expiry
            if (error)
                throw error;
            res.status(200).json({
                success: true,
                signedUrl: data.signedUrl,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.uploadController = new UploadController();
