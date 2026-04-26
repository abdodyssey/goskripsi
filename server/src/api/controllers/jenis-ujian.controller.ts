import { Request, Response, NextFunction } from 'express';
import { jenisUjianService } from '../../services/jenis-ujian.service';

export class JenisUjianController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jenisUjianService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jenisUjianService.getById(id);
      if (!data) return res.status(404).json({ message: 'JenisUjian tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jenisUjianService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await jenisUjianService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await jenisUjianService.delete(id);
      res.status(200).json({ message: 'JenisUjian berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const jenisUjianController = new JenisUjianController();
