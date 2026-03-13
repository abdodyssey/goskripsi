"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skripsiController = exports.SkripsiController = void 0;
const skripsi_service_1 = require("../../services/skripsi.service");
class SkripsiController {
    async index(req, res, next) {
        try {
            const data = await skripsi_service_1.skripsiService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await skripsi_service_1.skripsiService.getById(id);
            if (!data) {
                res.status(404).json({ message: "Skripsi tidak ditemukan" });
                return;
            }
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await skripsi_service_1.skripsiService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await skripsi_service_1.skripsiService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await skripsi_service_1.skripsiService.delete(id);
            res.status(200).json({ message: "Skripsi berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SkripsiController = SkripsiController;
exports.skripsiController = new SkripsiController();
