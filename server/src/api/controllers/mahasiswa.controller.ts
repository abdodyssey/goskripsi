import { Request, Response, NextFunction } from "express";
import { mahasiswaService } from "../../services/mahasiswa.service";
import { prisma } from "../../utils/prisma";

export class MahasiswaController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.user_id as string | undefined;
      const data = await mahasiswaService.getAll(userId);

      // Convert BigInts before sending JSON
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await mahasiswaService.getById(id);
      res.status(200).json({ data, success: true });
    } catch (error) {
      if (error instanceof Error && error.message === "Mahasiswa not found") {
        res.status(404).json({ message: error.message, success: false });
        return;
      }
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mahasiswaService.create(req.body);
      res
        .status(201)
        .json({ data, message: "Mahasiswa berhasil dibuat", success: true });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      // In production, integration with multer for req.file is needed here.
      // Mocking file link if uploaded (simulate Laravel URL logic).
      let fileUrl: string | undefined = undefined;
      const file = req.file as Express.Multer.File | undefined;
      if (file) {
        fileUrl = `http://localhost:3000/storage/ktm/${file.filename}`;
      }

      const data = await mahasiswaService.update(id, req.body, fileUrl);
      res
        .status(200)
        .json({ data, message: "Mahasiswa berhasil diupdate", success: true });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await mahasiswaService.delete(id);
      res
        .status(200)
        .json({ message: "Mahasiswa berhasil dihapus.", success: true });
    } catch (error) {
      next(error);
    }
  }

  async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }

      const docs = await prisma.dokumenMahasiswa.findMany({
        where: { mahasiswaId: Number(req.user.id) },
      });

      res.status(200).json({ data: docs, success: true });
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }

      const { jenis, fileUrl } = req.body;

      if (!jenis || !fileUrl) {
        return res
          .status(400)
          .json({ message: "Jenis and fileUrl are required", success: false });
      }

      const doc = await prisma.dokumenMahasiswa.upsert({
        where: {
          mahasiswaId_jenis: {
            mahasiswaId: Number(req.user.id),
            jenis: jenis,
          },
        },
        update: { fileUrl },
        create: {
          mahasiswaId: Number(req.user.id),
          jenis,
          fileUrl,
        },
      });

      res.status(200).json({
        data: doc,
        message: "Dokumen berhasil disimpan",
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }

      const { jenis } = req.params;

      await prisma.dokumenMahasiswa.delete({
        where: {
          mahasiswaId_jenis: {
            mahasiswaId: Number(req.user.id),
            jenis: jenis as any,
          },
        },
      });

      res
        .status(200)
        .json({ message: "Dokumen berhasil dihapus", success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const mahasiswaController = new MahasiswaController();
