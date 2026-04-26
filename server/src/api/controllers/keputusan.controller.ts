import { Request, Response, NextFunction } from "express";
import { keputusanService } from "../../services/keputusan.service";

export class KeputusanController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await keputusanService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await keputusanService.getById(id);
      if (!data)
        return res.status(404).json({ message: "Keputusan tidak ditemukan" });
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await keputusanService.store(req.body);
      res
        .status(201)
        .json({ data, message: "Keputusan berhasil dibuat", success: true });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await keputusanService.update(id, req.body);
      res.status(200).json({
        data,
        message: "Keputusan berhasil diperbarui",
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await keputusanService.delete(id);
      res
        .status(200)
        .json({ message: "Keputusan berhasil dihapus", success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const keputusanController = new KeputusanController();
