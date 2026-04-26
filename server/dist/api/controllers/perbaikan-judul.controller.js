"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perbaikanJudulController = exports.PerbaikanJudulController = void 0;
const perbaikan_judul_service_1 = require("../../services/perbaikan-judul.service");
const auth_service_1 = require("../../services/auth.service");
class PerbaikanJudulController {
    service = new perbaikan_judul_service_1.PerbaikanJudulService();
    async index(req, res, next) {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });
            const roles = await auth_service_1.authService.getUserRoles(user.id);
            const isSekprodi = roles.includes('sekprodi');
            const isKaprodi = roles.includes('kaprodi');
            if (!isSekprodi && !isKaprodi) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            const data = await this.service.getAllRequests();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getMyRequests(req, res, next) {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });
            const data = await this.service.getMyRequests(parseInt(user.id));
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });
            const data = await this.service.submitRequest({
                mahasiswaId: parseInt(user.id),
                ...req.body,
            });
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async review(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const data = await this.service.reviewRequest(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PerbaikanJudulController = PerbaikanJudulController;
exports.perbaikanJudulController = new PerbaikanJudulController();
