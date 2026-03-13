"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peminatanController = exports.PeminatanController = void 0;
const peminatan_service_1 = require("../../services/peminatan.service");
class PeminatanController {
    async index(req, res, next) {
        try {
            const data = await peminatan_service_1.peminatanService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await peminatan_service_1.peminatanService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Peminatan tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await peminatan_service_1.peminatanService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await peminatan_service_1.peminatanService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await peminatan_service_1.peminatanService.delete(id);
            res.status(200).json({ message: 'Peminatan berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PeminatanController = PeminatanController;
exports.peminatanController = new PeminatanController();
