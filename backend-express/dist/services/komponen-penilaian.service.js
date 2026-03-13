"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.komponenPenilaianService = exports.KomponenPenilaianService = void 0;
const prisma_1 = require("../utils/prisma");
class KomponenPenilaianService {
    async getAll() {
        return await prisma_1.prisma.komponenPenilaian.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.komponenPenilaian.findUnique({
            where: { id: Number(id) },
        });
    }
    async store(payload) {
        return await prisma_1.prisma.komponenPenilaian.create({
            data: {
                jenisUjianId: Number(payload.jenis_ujian_id),
                kriteria: payload.nama_komponen,
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.jenis_ujian_id !== undefined)
            dataUpdate.jenisUjianId = payload.jenis_ujian_id
                ? Number(payload.jenis_ujian_id)
                : null;
        if (payload.nama_komponen !== undefined)
            dataUpdate.kriteria = payload.nama_komponen;
        return await prisma_1.prisma.komponenPenilaian.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.komponenPenilaian.delete({
            where: { id: Number(id) },
        });
    }
}
exports.KomponenPenilaianService = KomponenPenilaianService;
exports.komponenPenilaianService = new KomponenPenilaianService();
