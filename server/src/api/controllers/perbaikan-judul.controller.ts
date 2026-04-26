import { Request, Response, NextFunction } from 'express';
import { PerbaikanJudulService } from '../../services/perbaikan-judul.service';
import { authService } from '../../services/auth.service';

export class PerbaikanJudulController {
  private service = new PerbaikanJudulService();

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const roles = await authService.getUserRoles(user.id);
      const isSekprodi = roles.includes('sekprodi');
      const isKaprodi = roles.includes('kaprodi');

      if (!isSekprodi && !isKaprodi) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const data = await this.service.getAllRequests();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const data = await this.service.getMyRequests(parseInt(user.id));
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const data = await this.service.submitRequest({
        mahasiswaId: parseInt(user.id),
        ...req.body,
      });
      res.status(201).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const data = await this.service.reviewRequest(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const perbaikanJudulController = new PerbaikanJudulController();
