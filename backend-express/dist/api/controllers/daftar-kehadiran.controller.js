"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daftarKehadiranController = exports.DaftarKehadiranController = void 0;
const daftar_kehadiran_service_1 = require("../../services/daftar-kehadiran.service");
class DaftarKehadiranController {
    async index(req, res, next) {
        try {
            const data = await daftar_kehadiran_service_1.daftarKehadiranService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await daftar_kehadiran_service_1.daftarKehadiranService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'DaftarKehadiran tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await daftar_kehadiran_service_1.daftarKehadiranService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await daftar_kehadiran_service_1.daftarKehadiranService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await daftar_kehadiran_service_1.daftarKehadiranService.delete(id);
            res.status(200).json({ message: 'DaftarKehadiran berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DaftarKehadiranController = DaftarKehadiranController;
exports.daftarKehadiranController = new DaftarKehadiranController();
