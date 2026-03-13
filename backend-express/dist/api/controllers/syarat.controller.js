"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syaratController = exports.SyaratController = void 0;
const syarat_service_1 = require("../../services/syarat.service");
class SyaratController {
    async index(req, res, next) {
        try {
            const data = await syarat_service_1.syaratService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getByJenisUjian(req, res, next) {
        try {
            const jenisUjianId = req.params.jenisUjianId;
            const data = await syarat_service_1.syaratService.getByJenisUjian(jenisUjianId);
            res.status(200).json({ data: data || [], success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await syarat_service_1.syaratService.getById(id);
            if (!data)
                return res.status(404).json({ message: "Syarat tida ditemukan" });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await syarat_service_1.syaratService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await syarat_service_1.syaratService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await syarat_service_1.syaratService.delete(id);
            res.status(200).json({ message: "Syarat berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SyaratController = SyaratController;
exports.syaratController = new SyaratController();
