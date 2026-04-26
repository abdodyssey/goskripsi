import { Request, Response, NextFunction } from 'express';
import { fakultasService } from '../../services/fakultas.service';

export class FakultasController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await fakultasService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await fakultasService.getById(id);
      if (!data) return res.status(404).json({ message: 'Fakultas tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await fakultasService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await fakultasService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await fakultasService.delete(id);
      res.status(200).json({ message: 'Fakultas berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const fakultasController = new FakultasController();
