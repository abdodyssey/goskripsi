"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pejabatService = exports.PejabatService = void 0;
const prisma_1 = require("../utils/prisma");
class PejabatService {
    async getAll() {
        return await prisma_1.prisma.pejabat.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.pejabat.findUnique({ where: { id: BigInt(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.pejabat.create({
            data: {
                nama_pejabat: payload.nama_pejabat,
                jabatan: payload.jabatan,
                no_hp: payload.no_hp,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = { updated_at: new Date() };
        if (payload.nama_pejabat !== undefined)
            dataUpdate.nama_pejabat = payload.nama_pejabat;
        if (payload.jabatan !== undefined)
            dataUpdate.jabatan = payload.jabatan;
        if (payload.no_hp !== undefined)
            dataUpdate.no_hp = payload.no_hp;
        return await prisma_1.prisma.pejabat.update({
            where: { id: BigInt(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.pejabat.delete({ where: { id: BigInt(id) } });
    }
}
exports.PejabatService = PejabatService;
exports.pejabatService = new PejabatService();
