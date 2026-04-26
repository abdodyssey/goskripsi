import { Router } from 'express';
import { perbaikanJudulController } from '../controllers/perbaikan-judul.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => perbaikanJudulController.index(req, res, next));
router.get('/me', (req, res, next) => perbaikanJudulController.getMyRequests(req, res, next));
router.post('/', (req, res, next) => perbaikanJudulController.store(req, res, next));
router.patch('/:id', (req, res, next) => perbaikanJudulController.review(req, res, next));

export default router;
