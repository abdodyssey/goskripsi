"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mahasiswaController = exports.MahasiswaController = void 0;
const mahasiswa_service_1 = require("../../services/mahasiswa.service");
class MahasiswaController {
    async index(req, res, next) {
        try {
            const userId = req.query.user_id;
            const data = await mahasiswa_service_1.mahasiswaService.getAll(userId);
            // Convert BigInts before sending JSON
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await mahasiswa_service_1.mahasiswaService.getById(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            if (error instanceof Error && error.message === "Mahasiswa not found") {
                res.status(404).json({ message: error.message, success: false });
                return;
            }
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await mahasiswa_service_1.mahasiswaService.create(req.body);
            res
                .status(201)
                .json({ data, message: "Mahasiswa berhasil dibuat", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            // In production, integration with multer for req.file is needed here.
            // Mocking file link if uploaded (simulate Laravel URL logic).
            let fileUrl = undefined;
            const file = req.file;
            if (file) {
                fileUrl = `http://localhost:3000/storage/ktm/${file.filename}`;
            }
            const data = await mahasiswa_service_1.mahasiswaService.update(id, req.body, fileUrl);
            res
                .status(200)
                .json({ data, message: "Mahasiswa berhasil diupdate", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await mahasiswa_service_1.mahasiswaService.delete(id);
            res
                .status(200)
                .json({ message: "Mahasiswa berhasil dihapus.", success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MahasiswaController = MahasiswaController;
exports.mahasiswaController = new MahasiswaController();
