"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keputusanService = exports.KeputusanService = void 0;
const prisma_1 = require("../utils/prisma");
class KeputusanService {
    async getAll() {
        return await prisma_1.prisma.keputusan.findMany({
            include: {
                jenisUjian: true,
            },
        });
    }
    async getById(id) {
        return await prisma_1.prisma.keputusan.findUnique({
            where: { id: Number(id) },
            include: {
                jenisUjian: true,
            },
        });
    }
    async store(payload) {
        return await prisma_1.prisma.keputusan.create({
            data: {
                kode: payload.kode,
                namaKeputusan: payload.nama_keputusan,
                jenisUjianId: payload.jenis_ujian_id
                    ? Number(payload.jenis_ujian_id)
                    : null,
                aktif: payload.aktif ?? true,
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.kode !== undefined)
            dataUpdate.kode = payload.kode;
        if (payload.nama_keputusan !== undefined)
            dataUpdate.namaKeputusan = payload.nama_keputusan;
        if (payload.jenis_ujian_id !== undefined)
            dataUpdate.jenisUjianId = payload.jenis_ujian_id
                ? Number(payload.jenis_ujian_id)
                : null;
        if (payload.aktif !== undefined)
            dataUpdate.aktif = payload.aktif;
        return await prisma_1.prisma.keputusan.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.keputusan.delete({
            where: { id: Number(id) },
        });
    }
}
exports.KeputusanService = KeputusanService;
exports.keputusanService = new KeputusanService();
