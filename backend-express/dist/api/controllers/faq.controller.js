"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqController = exports.FaqController = void 0;
const faq_service_1 = require("../../services/faq.service");
class FaqController {
    async index(req, res, next) {
        try {
            const data = await faq_service_1.faqService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await faq_service_1.faqService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'Faq tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await faq_service_1.faqService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await faq_service_1.faqService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await faq_service_1.faqService.delete(id);
            res.status(200).json({ message: 'Faq berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FaqController = FaqController;
exports.faqController = new FaqController();
