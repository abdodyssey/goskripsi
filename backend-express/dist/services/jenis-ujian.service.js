"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jenisUjianService = exports.JenisUjianService = void 0;
const prisma_1 = require("../utils/prisma");
class JenisUjianService {
    async getAll() {
        const list = await prisma_1.prisma.jenisUjian.findMany();
        return list.map((j) => this.transformJenisUjian(j));
    }
    async getById(id) {
        const j = await prisma_1.prisma.jenisUjian.findUnique({ where: { id: Number(id) } });
        return this.transformJenisUjian(j);
    }
    async store(payload) {
        const result = await prisma_1.prisma.jenisUjian.create({
            data: {
                namaJenis: payload.nama_jenis,
                deskripsi: payload.deskripsi,
            },
        });
        return this.transformJenisUjian(result);
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_jenis !== undefined)
            dataUpdate.namaJenis = payload.nama_jenis;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        const result = await prisma_1.prisma.jenisUjian.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
        return this.transformJenisUjian(result);
    }
    async delete(id) {
        return await prisma_1.prisma.jenisUjian.delete({ where: { id: Number(id) } });
    }
    transformJenisUjian(j) {
        if (!j)
            return null;
        return {
            id: j.id,
            namaJenis: j.namaJenis,
            deskripsi: j.deskripsi,
            aktif: j.aktif,
        };
    }
}
exports.JenisUjianService = JenisUjianService;
exports.jenisUjianService = new JenisUjianService();
