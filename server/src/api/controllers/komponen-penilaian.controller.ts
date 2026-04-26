import { Request, Response, NextFunction } from 'express';
import { komponenPenilaianService } from '../../services/komponen-penilaian.service';

export class KomponenPenilaianController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await komponenPenilaianService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await komponenPenilaianService.getById(id);
      if (!data) return res.status(404).json({ message: 'KomponenPenilaian tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await komponenPenilaianService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await komponenPenilaianService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await komponenPenilaianService.delete(id);
      res.status(200).json({ message: 'KomponenPenilaian berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const komponenPenilaianController = new KomponenPenilaianController();
