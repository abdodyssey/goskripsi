import { Request, Response, NextFunction } from "express";
import { penilaianService } from "../../services/penilaian.service";

export class PenilaianController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await penilaianService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await penilaianService.getById(id);
      if (!data) {
        res.status(404).json({ message: "Penilaian tidak ditemukan" });
        return;
      }
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await penilaianService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const isBatch = "data" in req.body;
      const id = isBatch ? undefined : (req.params.id as string);

      const data = await penilaianService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await penilaianService.delete(id);
      res.status(200).json({ message: "Penilaian berhasil dihapus." });
    } catch (error) {
      next(error);
    }
  }
}

export const penilaianController = new PenilaianController();
