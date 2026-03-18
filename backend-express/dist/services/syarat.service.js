"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syaratService = exports.SyaratService = void 0;
const prisma_1 = require("../utils/prisma");
class SyaratService {
    async getAll() {
        return await prisma_1.prisma.syarat.findMany({ include: { jenisUjian: true } });
    }
    async getByJenisUjian(jenisUjianId) {
        const list = await prisma_1.prisma.syarat.findMany({
            where: { jenisUjianId: Number(jenisUjianId) },
            orderBy: [{ wajib: "desc" }, { id: "asc" }],
        });
        return list.map((s) => this.transformSyarat(s));
    }
    async getById(id) {
        return await prisma_1.prisma.syarat.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        const result = await prisma_1.prisma.syarat.create({
            data: {
                jenisUjianId: Number(payload.jenis_ujian_id),
                namaSyarat: payload.nama_syarat,
                deskripsi: payload.deskripsi || null,
                wajib: payload.wajib !== undefined ? payload.wajib : true,
            },
        });
        return this.transformSyarat(result);
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
        const result = await prisma_1.prisma.syarat.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
        return this.transformSyarat(result);
    }
    async delete(id) {
        return await prisma_1.prisma.syarat.delete({ where: { id: Number(id) } });
    }
    transformSyarat(s) {
        if (!s)
            return null;
        return {
            id: s.id,
            jenisUjianId: s.jenisUjianId,
            namaSyarat: s.namaSyarat,
            deskripsi: s.deskripsi,
            wajib: s.wajib,
        };
    }
}
exports.SyaratService = SyaratService;
exports.syaratService = new SyaratService();
