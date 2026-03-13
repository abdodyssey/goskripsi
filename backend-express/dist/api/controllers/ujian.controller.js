"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ujianController = exports.UjianController = void 0;
const ujian_service_1 = require("../../services/ujian.service");
class UjianController {
    async index(req, res, next) {
        try {
            const data = await ujian_service_1.ujianService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ujian_service_1.ujianService.getById(id);
            if (!data) {
                res.status(404).json({ message: "Ujian tidak ditemukan" });
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
            const data = await ujian_service_1.ujianService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ujian_service_1.ujianService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await ujian_service_1.ujianService.delete(id);
            res.status(200).json({ message: "Ujian berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
    async getByMahasiswa(req, res, next) {
        try {
            const id = req.params.id;
            const namaJenis = req.query.nama_jenis;
            const data = await ujian_service_1.ujianService.getByMahasiswa(id, namaJenis);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UjianController = UjianController;
exports.ujianController = new UjianController();
