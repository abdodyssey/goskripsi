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
    async getSchedulingForm(req, res, next) {
        try {
            const pendaftaranId = req.params.pendaftaranId;
            const data = await ujian_service_1.ujianService.getSchedulingFormData(pendaftaranId);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async createScheduling(req, res, next) {
        try {
            const data = await ujian_service_1.ujianService.createScheduling(req.body);
            res
                .status(201)
                .json({ data, success: true, message: "Jadwal berhasil dibuat" });
        }
        catch (error) {
            next(error);
        }
    }
    async updateScheduling(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ujian_service_1.ujianService.updateScheduling(id, req.body);
            res
                .status(200)
                .json({ data, success: true, message: "Jadwal berhasil diperbarui" });
        }
        catch (error) {
            next(error);
        }
    }
    async submitAbsensi(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.submitAbsensi(userId, id, req.body.absensiList);
            res
                .status(200)
                .json({ data, success: true, message: "Absensi berhasil disubmit" });
        }
        catch (error) {
            next(error);
        }
    }
    async getFormInputNilai(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.getFormInputNilai(userId, id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async simpanDraftNilai(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.simpanDraftNilai(userId, id, req.body.penilaianList);
            res
                .status(200)
                .json({ data, success: true, message: "Draft nilai disimpan" });
        }
        catch (error) {
            next(error);
        }
    }
    async submitNilaiFinal(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.submitNilaiFinal(userId, id, req.body.penilaianList);
            res
                .status(200)
                .json({ data, success: true, message: "Nilai final disubmit" });
        }
        catch (error) {
            next(error);
        }
    }
    async finalisasiNilai(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.finalisasiNilai(userId, id);
            res
                .status(200)
                .json({ data, success: true, message: "Nilai berhasil difinalisasi" });
        }
        catch (error) {
            next(error);
        }
    }
    async getDataKeputusan(req, res, next) {
        try {
            const id = Number(req.params.id);
            const data = await ujian_service_1.ujianService.getDataKeputusan(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async submitKeputusan(req, res, next) {
        try {
            const id = Number(req.params.id);
            const userId = Number(req.user?.id);
            const data = await ujian_service_1.ujianService.submitKeputusan(userId, id, req.body);
            res
                .status(200)
                .json({ data, success: true, message: "Keputusan berhasil disubmit" });
        }
        catch (error) {
            next(error);
        }
    }
    async printJadwal(req, res, next) {
        try {
            const pdfBuffer = await ujian_service_1.ujianService.generateJadwalUjianPdf();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=Jadwal_Ujian.pdf");
            res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    async generateBulkPdf(req, res, next) {
        try {
            const id = Number(req.params.id);
            const pdfBuffer = await ujian_service_1.ujianService.generateBulkPdf(id);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=Berkas_Ujian_${id}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UjianController = UjianController;
exports.ujianController = new UjianController();
