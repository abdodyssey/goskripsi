"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendaftaranUjianController = exports.PendaftaranUjianController = void 0;
const pendaftaran_ujian_service_1 = require("../../services/pendaftaran-ujian.service");
class PendaftaranUjianController {
    async index(req, res, next) {
        try {
            const data = await pendaftaran_ujian_service_1.pendaftaranUjianService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pendaftaran_ujian_service_1.pendaftaranUjianService.getById(id);
            if (!data) {
                res.status(404).json({ message: "Pendaftaran Ujian not found" });
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
            const files = req.files || [];
            console.log(`[PendaftaranUjian] Creating with ${files.length} files`, {
                body: req.body,
                fileNames: files.map((f) => f.originalname),
            });
            const data = await pendaftaran_ujian_service_1.pendaftaranUjianService.store(req.body, files);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            console.error(`[PendaftaranUjian] Store error:`, error);
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const files = req.files || [];
            const data = await pendaftaran_ujian_service_1.pendaftaranUjianService.update(id, req.body, files);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await pendaftaran_ujian_service_1.pendaftaranUjianService.delete(id);
            res.status(200).json({ message: "Pendaftaran ujian berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
    // Relations Lookups
    async getByMahasiswa(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pendaftaran_ujian_service_1.pendaftaranUjianService.getByMahasiswa(id);
            res.status(200).json({ data: data || [], success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PendaftaranUjianController = PendaftaranUjianController;
exports.pendaftaranUjianController = new PendaftaranUjianController();
