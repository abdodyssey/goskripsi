"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruanganController = exports.RuanganController = void 0;
const ruangan_service_1 = require("../../services/ruangan.service");
class RuanganController {
    async index(req, res, next) {
        try {
            const data = await ruangan_service_1.ruanganService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ruangan_service_1.ruanganService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Ruangan tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await ruangan_service_1.ruanganService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ruangan_service_1.ruanganService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await ruangan_service_1.ruanganService.delete(id);
            res.status(200).json({ message: 'Ruangan berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RuanganController = RuanganController;
exports.ruanganController = new RuanganController();
