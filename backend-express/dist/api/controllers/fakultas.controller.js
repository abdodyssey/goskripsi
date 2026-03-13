"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakultasController = exports.FakultasController = void 0;
const fakultas_service_1 = require("../../services/fakultas.service");
class FakultasController {
    async index(req, res, next) {
        try {
            const data = await fakultas_service_1.fakultasService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await fakultas_service_1.fakultasService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Fakultas tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await fakultas_service_1.fakultasService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await fakultas_service_1.fakultasService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await fakultas_service_1.fakultasService.delete(id);
            res.status(200).json({ message: 'Fakultas berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FakultasController = FakultasController;
exports.fakultasController = new FakultasController();
