"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perbaikanJudulController = exports.PerbaikanJudulController = void 0;
const perbaikan_judul_service_1 = require("../../services/perbaikan-judul.service");
class PerbaikanJudulController {
    async index(req, res, next) {
        try {
            const data = await perbaikan_judul_service_1.perbaikanJudulService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const files = req.files || [];
            const data = await perbaikan_judul_service_1.perbaikanJudulService.store(req.body, files);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const files = req.files || [];
            const data = await perbaikan_judul_service_1.perbaikanJudulService.update(id, req.body, files);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await perbaikan_judul_service_1.perbaikanJudulService.delete(id);
            res.status(200).json({ message: "Perbaikan judul deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    // Relations Lookups
    async getByMahasiswa(req, res, next) {
        try {
            const id = req.params.id;
            const data = await perbaikan_judul_service_1.perbaikanJudulService.getByMahasiswa(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getByPembimbing(req, res, next) {
        try {
            const id = req.params.id;
            const data = await perbaikan_judul_service_1.perbaikanJudulService.getByPembimbing(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getByDosenPa(req, res, next) {
        try {
            // Stubing based on perbaikanJudulService using logic getByPembimbing
            const id = req.params.id;
            const data = await perbaikan_judul_service_1.perbaikanJudulService.getByPembimbing(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PerbaikanJudulController = PerbaikanJudulController;
exports.perbaikanJudulController = new PerbaikanJudulController();
