"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodiService = exports.ProdiService = void 0;
const prisma_1 = require("../utils/prisma");
class ProdiService {
    async getAll() {
        return await prisma_1.prisma.prodi.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.prodi.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.prodi.create({
            data: {
                namaProdi: payload.nama_prodi,
                fakultasId: Number(payload.fakultas_id),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_prodi !== undefined)
            dataUpdate.namaProdi = payload.nama_prodi;
        if (payload.fakultas_id !== undefined)
            dataUpdate.fakultasId = payload.fakultas_id
                ? Number(payload.fakultas_id)
                : null;
        return await prisma_1.prisma.prodi.update({
            where: { id: Number(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.prodi.delete({ where: { id: Number(id) } });
    }
}
exports.ProdiService = ProdiService;
exports.prodiService = new ProdiService();
