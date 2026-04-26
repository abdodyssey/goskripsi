import { Request, Response, NextFunction } from "express";
import { pendaftaranUjianService } from "../../services/pendaftaran-ujian.service";

export class PendaftaranUjianController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pendaftaranUjianService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await pendaftaranUjianService.getById(id);
      if (!data) {
        res.status(404).json({ message: "Pendaftaran Ujian not found" });
        return;
      }
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      console.log(`[PendaftaranUjian] Creating with ${files.length} files`, {
        body: req.body,
        fileNames: files.map((f) => f.originalname),
      });
      const data = await pendaftaranUjianService.store(req.body, files);
      res.status(201).json({ data, success: true });
    } catch (error) {
      console.error(`[PendaftaranUjian] Store error:`, error);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const files = (req.files as Express.Multer.File[]) || [];
      const data = await pendaftaranUjianService.update(id, req.body, files);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await pendaftaranUjianService.delete(id);
      res.status(200).json({ message: "Pendaftaran ujian berhasil dihapus." });
    } catch (error) {
      next(error);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await pendaftaranUjianService.submit(id);
      res
        .status(200)
        .json({
          data,
          success: true,
          message: "Pendaftaran berhasil di-submit",
        });
    } catch (error) {
      next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, keterangan } = req.body;
      const data = await pendaftaranUjianService.review(id, status, keterangan);
      res
        .status(200)
        .json({
          data,
          success: true,
          message: `Pendaftaran berhasil di-${status}`,
        });
    } catch (error) {
      next(error);
    }
  }

  async uploadRevisi(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const files = (req.files as Express.Multer.File[]) || [];
      const data = await pendaftaranUjianService.uploadRevisi(id, files);
      res
        .status(200)
        .json({
          data,
          success: true,
          message: "Berkas revisi berhasil di-upload",
        });
    } catch (error) {
      next(error);
    }
  }

  // Relations Lookups
  async getByMahasiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await pendaftaranUjianService.getByMahasiswa(id);
      res.status(200).json({ data: data || [], success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const pendaftaranUjianController = new PendaftaranUjianController();
