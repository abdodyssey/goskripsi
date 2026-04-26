"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.penilaianController = exports.PenilaianController = void 0;
const penilaian_service_1 = require("../../services/penilaian.service");
class PenilaianController {
    async index(req, res, next) {
        try {
            const data = await penilaian_service_1.penilaianService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await penilaian_service_1.penilaianService.getById(id);
            if (!data) {
                res.status(404).json({ message: "Penilaian tidak ditemukan" });
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
            const data = await penilaian_service_1.penilaianService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const isBatch = "data" in req.body;
            const id = isBatch ? undefined : req.params.id;
            const data = await penilaian_service_1.penilaianService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await penilaian_service_1.penilaianService.delete(id);
            res.status(200).json({ message: "Penilaian berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PenilaianController = PenilaianController;
exports.penilaianController = new PenilaianController();
