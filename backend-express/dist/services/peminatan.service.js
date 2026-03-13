"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peminatanService = exports.PeminatanService = void 0;
const prisma_1 = require("../utils/prisma");
class PeminatanService {
    async getAll() {
        return await prisma_1.prisma.peminatan.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.peminatan.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.peminatan.create({
            data: {
                namaPeminatan: payload.nama_peminatan,
                prodiId: Number(payload.prodi_id),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_peminatan !== undefined)
            dataUpdate.namaPeminatan = payload.nama_peminatan;
        if (payload.prodi_id !== undefined)
            dataUpdate.prodiId = payload.prodi_id ? Number(payload.prodi_id) : null;
        return await prisma_1.prisma.peminatan.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.peminatan.delete({ where: { id: Number(id) } });
    }
}
exports.PeminatanService = PeminatanService;
exports.peminatanService = new PeminatanService();
