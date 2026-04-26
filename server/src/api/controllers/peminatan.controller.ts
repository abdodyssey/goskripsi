import { Request, Response, NextFunction } from 'express';
import { peminatanService } from '../../services/peminatan.service';

export class PeminatanController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await peminatanService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await peminatanService.getById(id);
      if (!data) return res.status(404).json({ message: 'Peminatan tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await peminatanService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await peminatanService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await peminatanService.delete(id);
      res.status(200).json({ message: 'Peminatan berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const peminatanController = new PeminatanController();
