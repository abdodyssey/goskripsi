"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pemenuhanSyaratController = exports.PemenuhanSyaratController = void 0;
const pemenuhan_syarat_service_1 = require("../../services/pemenuhan-syarat.service");
class PemenuhanSyaratController {
    async index(req, res, next) {
        try {
            const data = await pemenuhan_syarat_service_1.pemenuhanSyaratService.getAll();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async show(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pemenuhan_syarat_service_1.pemenuhanSyaratService.getById(id);
            if (!data)
                return res.status(404).json({ message: 'PemenuhanSyarat tida ditemukan' });
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await pemenuhan_syarat_service_1.pemenuhanSyaratService.store(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = await pemenuhan_syarat_service_1.pemenuhanSyaratService.update(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async destroy(req, res, next) {
        try {
            const id = req.params.id;
            await pemenuhan_syarat_service_1.pemenuhanSyaratService.delete(id);
            res.status(200).json({ message: 'PemenuhanSyarat berhasil dihapus.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PemenuhanSyaratController = PemenuhanSyaratController;
exports.pemenuhanSyaratController = new PemenuhanSyaratController();
