"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodiController = exports.ProdiController = void 0;
const prodi_service_1 = require("../../services/prodi.service");
class ProdiController {
    async index(req, res, next) {
        try {
            const data = await prodi_service_1.prodiService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await prodi_service_1.prodiService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Prodi tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await prodi_service_1.prodiService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await prodi_service_1.prodiService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await prodi_service_1.prodiService.delete(id);
            res.status(200).json({ message: 'Prodi berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProdiController = ProdiController;
exports.prodiController = new ProdiController();
