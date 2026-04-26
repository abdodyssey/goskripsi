"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jenisUjianController = exports.JenisUjianController = void 0;
const jenis_ujian_service_1 = require("../../services/jenis-ujian.service");
class JenisUjianController {
    async index(req, res, next) {
        try {
            const data = await jenis_ujian_service_1.jenisUjianService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await jenis_ujian_service_1.jenisUjianService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'JenisUjian tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await jenis_ujian_service_1.jenisUjianService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await jenis_ujian_service_1.jenisUjianService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await jenis_ujian_service_1.jenisUjianService.delete(id);
            res.status(200).json({ message: 'JenisUjian berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JenisUjianController = JenisUjianController;
exports.jenisUjianController = new JenisUjianController();
