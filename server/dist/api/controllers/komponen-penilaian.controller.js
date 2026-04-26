"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.komponenPenilaianController = exports.KomponenPenilaianController = void 0;
const komponen_penilaian_service_1 = require("../../services/komponen-penilaian.service");
class KomponenPenilaianController {
    async index(req, res, next) {
        try {
            const data = await komponen_penilaian_service_1.komponenPenilaianService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await komponen_penilaian_service_1.komponenPenilaianService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'KomponenPenilaian tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await komponen_penilaian_service_1.komponenPenilaianService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await komponen_penilaian_service_1.komponenPenilaianService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await komponen_penilaian_service_1.komponenPenilaianService.delete(id);
            res.status(200).json({ message: 'KomponenPenilaian berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.KomponenPenilaianController = KomponenPenilaianController;
exports.komponenPenilaianController = new KomponenPenilaianController();
