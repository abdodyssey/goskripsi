"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pejabatController = exports.PejabatController = void 0;
const pejabat_service_1 = require("../../services/pejabat.service");
class PejabatController {
    async index(req, res, next) {
        try {
            const data = await pejabat_service_1.pejabatService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pejabat_service_1.pejabatService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Pejabat tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await pejabat_service_1.pejabatService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pejabat_service_1.pejabatService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await pejabat_service_1.pejabatService.delete(id);
            res.status(200).json({ message: 'Pejabat berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PejabatController = PejabatController;
exports.pejabatController = new PejabatController();
