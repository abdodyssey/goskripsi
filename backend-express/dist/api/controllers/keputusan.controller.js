"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keputusanController = exports.KeputusanController = void 0;
const keputusan_service_1 = require("../../services/keputusan.service");
class KeputusanController {
    async index(req, res, next) {
        try {
            const data = await keputusan_service_1.keputusanService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await keputusan_service_1.keputusanService.getById(id);
            if (!data)
                return res.status(404).json({ message: "Keputusan tidak ditemukan" });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await keputusan_service_1.keputusanService.store(req.body);
            res
                .status(201)
                .json({ data, message: "Keputusan berhasil dibuat", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await keputusan_service_1.keputusanService.update(id, req.body);
            res.status(200).json({
                data,
                message: "Keputusan berhasil diperbarui",
                success: true,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await keputusan_service_1.keputusanService.delete(id);
            res
                .status(200)
                .json({ message: "Keputusan berhasil dihapus", success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.KeputusanController = KeputusanController;
exports.keputusanController = new KeputusanController();
