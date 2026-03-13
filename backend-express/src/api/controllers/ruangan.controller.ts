import { Request, Response, NextFunction } from 'express';
import { ruanganService } from '../../services/ruangan.service';

export class RuanganController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ruanganService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ruanganService.getById(id);
      if (!data) return res.status(404).json({ message: 'Ruangan tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ruanganService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ruanganService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ruanganService.delete(id);
      res.status(200).json({ message: 'Ruangan berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const ruanganController = new RuanganController();
