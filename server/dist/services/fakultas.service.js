"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakultasService = exports.FakultasService = void 0;
const prisma_1 = require("../utils/prisma");
class FakultasService {
    async getAll() {
        return await prisma_1.prisma.fakultas.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.fakultas.findUnique({ where: { id: Number(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.fakultas.create({
            data: {
                namaFakultas: payload.nama_fakultas,
            }
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.nama_fakultas !== undefined)
            dataUpdate.namaFakultas = payload.nama_fakultas;
        return await prisma_1.prisma.fakultas.update({
            where: { id: Number(id) },
            data: dataUpdate
        });
    }
    async delete(id) {
        return await prisma_1.prisma.fakultas.delete({ where: { id: Number(id) } });
    }
}
exports.FakultasService = FakultasService;
exports.fakultasService = new FakultasService();
