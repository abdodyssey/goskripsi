"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruanganService = exports.RuanganService = void 0;
const prisma_1 = require("../utils/prisma");
class RuanganService {
    async getAll() {
        return await prisma_1.prisma.ruangan.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.ruangan.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.ruangan.create({
            data: {
                namaRuangan: payload.nama_ruangan,
                deskripsi: payload.deskripsi,
                prodiId: Number(payload.prodi_id),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_ruangan !== undefined)
            dataUpdate.namaRuangan = payload.nama_ruangan;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        if (payload.prodi_id !== undefined)
            dataUpdate.prodiId = payload.prodi_id ? Number(payload.prodi_id) : null;
        return await prisma_1.prisma.ruangan.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.ruangan.delete({ where: { id: Number(id) } });
    }
}
exports.RuanganService = RuanganService;
exports.ruanganService = new RuanganService();
