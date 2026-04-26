import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../../utils/supabase";
import path from "path";

/**
 * Controller specifically for handling Secure File Uploads to Supabase Storage
 */
class UploadController {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
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
          storagePath = `signatures/students/${nipOrNim}/ttd_mahasiswa${path.extname(file.originalname)}`;
        } else {
          // Lecturer Path: skripsi_docs/signatures/{{nip}}/ttd_official.png
          storagePath = `signatures/${nipOrNim}/ttd_official${path.extname(file.originalname)}`;
        }
      } else if (type === "submission") {
        // Path: skripsi_docs/submissions/{{nim_mahasiswa}}/{{file_name}}.pdf
        const nim = owner_id || user.nip_nim;
        const sanitizedFilename = file.originalname
          .replace(/[^a-z0-9.]/gi, "_")
          .toLowerCase();
        storagePath = `submissions/${nim}/${sanitizedFilename}`;
      } else if (type === "mahasiswa_doc") {
        // Path: skripsi_docs/mahasiswa/documents/{{nim}}/{{jenis}}{{ext}}
        const nim = user.nip_nim;
        const { jenis } = req.body;
        if (!jenis) {
          return res
            .status(400)
            .json({ message: "Jenis dokumen is required", success: false });
        }
        storagePath = `mahasiswa/documents/${nim}/${jenis}${path.extname(file.originalname)}`;
      } else if (type === "perbaikan_judul") {
        // Path: skripsi_docs/mahasiswa/perbaikan-judul/{{nim}}/{{timestamp}}_{{filename}}
        const nim = user.nip_nim;
        const sanitizedFilename = file.originalname
          .replace(/[^a-z0-9.]/gi, "_")
          .toLowerCase();
        storagePath = `mahasiswa/perbaikan-judul/${nim}/${Date.now()}_${sanitizedFilename}`;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid upload type", success: false });
      }

      // 3. Upload via service_role to bypass RLS, but we've validated the session above
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true, // Required for updating signatures
        });

      if (error) {
        throw error;
      }

      // 4. Return success metadata
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      res.status(200).json({
        message: "File uploaded successfully",
        success: true,
        data: {
          path: data.path,
          fullUrl: publicUrlData.publicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.body;
      const bucket = "skripsi_docs";

      if (!path) {
        return res
          .status(400)
          .json({ message: "Path is required", success: false });
      }

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 60); // 60 seconds expiry

      if (error) throw error;

      res.status(200).json({
        success: true,
        signedUrl: data.signedUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
