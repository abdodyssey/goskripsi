"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jenisUjianService = exports.JenisUjianService = void 0;
const prisma_1 = require("../utils/prisma");
class JenisUjianService {
    async getAll() {
        return await prisma_1.prisma.jenisUjian.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.jenisUjian.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.jenisUjian.create({
            data: {
                namaJenis: payload.nama_jenis,
                deskripsi: payload.deskripsi,
            }
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_jenis !== undefined)
            dataUpdate.namaJenis = payload.nama_jenis;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        return await prisma_1.prisma.jenisUjian.update({
            where: { id: Number(id) },
            data: dataUpdate
        });
    }
    async delete(id) {
        return await prisma_1.prisma.jenisUjian.delete({ where: { id: Number(id) } });
    }
}
exports.JenisUjianService = JenisUjianService;
exports.jenisUjianService = new JenisUjianService();
