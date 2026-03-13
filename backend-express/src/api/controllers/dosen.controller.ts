import { Request, Response, NextFunction } from "express";
import { dosenService } from "../../services/dosen.service";

export class DosenController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.user_id as string | undefined;
      const data = await dosenService.getAll(userId);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await dosenService.getById(id);
      res.status(200).json({ data, success: true });
    } catch (error) {
      if (error instanceof Error && error.message === "Dosen not found") {
        res.status(404).json({ message: error.message, success: false });
        return;
      }
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dosenService.create(req.body);
      res
        .status(201)
        .json({ data, message: "Dosen berhasil dibuat", success: true });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      // In production, integration with multer for req.file is needed here
      let ttdUrl: string | undefined = undefined;
      if (req.file) {
        ttdUrl = `http://localhost:3000/storage/signatures/${req.file.filename}`;
      }

      const data = await dosenService.update(id, req.body, ttdUrl);
      res
        .status(200)
        .json({ data, message: "Dosen berhasil diupdate", success: true });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await dosenService.delete(id);
      res
        .status(200)
        .json({ message: "Dosen berhasil dihapus.", success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const dosenController = new DosenController();
