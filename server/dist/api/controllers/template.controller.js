"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateController = exports.TemplateController = void 0;
const template_service_1 = require("../../services/template.service");
class TemplateController {
    async index(req, res, next) {
        try {
            const data = await template_service_1.templateService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await template_service_1.templateService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Template tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await template_service_1.templateService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await template_service_1.templateService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await template_service_1.templateService.delete(id);
            res.status(200).json({ message: 'Template berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TemplateController = TemplateController;
exports.templateController = new TemplateController();
