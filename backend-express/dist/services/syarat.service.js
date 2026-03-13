"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syaratService = exports.SyaratService = void 0;
const prisma_1 = require("../utils/prisma");
class SyaratService {
    async getAll() {
        return await prisma_1.prisma.syarat.findMany({ include: { jenisUjian: true } });
    }
    async getByJenisUjian(jenisUjianId) {
        return await prisma_1.prisma.syarat.findMany({
            where: { jenisUjianId: Number(jenisUjianId) },
            orderBy: [{ wajib: "desc" }, { id: "asc" }],
        });
    }
    async getById(id) {
        return await prisma_1.prisma.syarat.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.syarat.create({
            data: {
                jenisUjianId: Number(payload.jenis_ujian_id),
                namaSyarat: payload.nama_syarat,
                deskripsi: payload.deskripsi || null,
                wajib: payload.wajib !== undefined ? payload.wajib : true,
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.jenis_ujian_id !== undefined)
            dataUpdate.jenisUjianId = payload.jenis_ujian_id
                ? Number(payload.jenis_ujian_id)
                : null;
        if (payload.nama_syarat !== undefined)
            dataUpdate.namaSyarat = payload.nama_syarat;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        if (payload.wajib !== undefined)
            dataUpdate.wajib = payload.wajib;
        return await prisma_1.prisma.syarat.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.syarat.delete({ where: { id: Number(id) } });
    }
}
exports.SyaratService = SyaratService;
exports.syaratService = new SyaratService();
