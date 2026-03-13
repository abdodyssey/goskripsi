import { Request, Response, NextFunction } from 'express';
import { pemenuhanSyaratService } from '../../services/pemenuhan-syarat.service';

export class PemenuhanSyaratController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pemenuhanSyaratService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await pemenuhanSyaratService.getById(id);
      if (!data) return res.status(404).json({ message: 'PemenuhanSyarat tida ditemukan' });
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await pemenuhanSyaratService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await pemenuhanSyaratService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) { next(error); }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await pemenuhanSyaratService.delete(id);
      res.status(200).json({ message: 'PemenuhanSyarat berhasil dihapus.' });
    } catch (error) { next(error); }
  }
}

export const pemenuhanSyaratController = new PemenuhanSyaratController();
