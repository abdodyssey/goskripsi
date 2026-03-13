"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dosenController = exports.DosenController = void 0;
const dosen_service_1 = require("../../services/dosen.service");
class DosenController {
    async index(req, res, next) {
        try {
            const userId = req.query.user_id;
            const data = await dosen_service_1.dosenService.getAll(userId);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await dosen_service_1.dosenService.getById(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            if (error instanceof Error && error.message === "Dosen not found") {
                res.status(404).json({ message: error.message, success: false });
                return;
            }
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await dosen_service_1.dosenService.create(req.body);
            res
                .status(201)
                .json({ data, message: "Dosen berhasil dibuat", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            // In production, integration with multer for req.file is needed here
            let ttdUrl = undefined;
            if (req.file) {
                ttdUrl = `http://localhost:3000/storage/signatures/${req.file.filename}`;
            }
            const data = await dosen_service_1.dosenService.update(id, req.body, ttdUrl);
            res
                .status(200)
                .json({ data, message: "Dosen berhasil diupdate", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await dosen_service_1.dosenService.delete(id);
            res
                .status(200)
                .json({ message: "Dosen berhasil dihapus.", success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DosenController = DosenController;
exports.dosenController = new DosenController();
