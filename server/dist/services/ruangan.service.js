"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruanganService = exports.RuanganService = void 0;
const prisma_1 = require("../utils/prisma");
class RuanganService {
    async getAll() {
        const list = await prisma_1.prisma.ruangan.findMany();
        return list.map((r) => this.transformRuangan(r));
    }
    async getById(id) {
        const r = await prisma_1.prisma.ruangan.findUnique({ where: { id: Number(id) } });
        return this.transformRuangan(r);
    }
    async store(payload) {
        const result = await prisma_1.prisma.ruangan.create({
            data: {
                namaRuangan: payload.nama_ruangan,
                deskripsi: payload.deskripsi,
                prodiId: Number(payload.prodi_id),
            },
        });
        return this.transformRuangan(result);
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_ruangan !== undefined)
            dataUpdate.namaRuangan = payload.nama_ruangan;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        if (payload.prodi_id !== undefined)
            dataUpdate.prodiId = payload.prodi_id ? Number(payload.prodi_id) : null;
        const result = await prisma_1.prisma.ruangan.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
        return this.transformRuangan(result);
    }
    async delete(id) {
        return await prisma_1.prisma.ruangan.delete({ where: { id: Number(id) } });
    }
    transformRuangan(r) {
        if (!r)
            return null;
        return {
            id: r.id,
            namaRuangan: r.namaRuangan,
            deskripsi: r.deskripsi,
            prodiId: r.prodiId,
        };
    }
}
exports.RuanganService = RuanganService;
exports.ruanganService = new RuanganService();
