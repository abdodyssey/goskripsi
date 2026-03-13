"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skripsiService = exports.SkripsiService = void 0;
const prisma_1 = require("../utils/prisma");
class SkripsiService {
    async getAll() {
        return await prisma_1.prisma.skripsi.findMany({
            include: {
                mahasiswa: true,
                ranpel: true,
                dosen_skripsi_pembimbing_1Todosen: true,
                dosen_skripsi_pembimbing_2Todosen: true,
            },
        });
    }
    async getById(id) {
        return await prisma_1.prisma.skripsi.findUnique({
            where: { id: BigInt(id) },
            include: {
                mahasiswa: true,
                ranpel: true,
                dosen_skripsi_pembimbing_1Todosen: true,
                dosen_skripsi_pembimbing_2Todosen: true,
            },
        });
    }
    async store(payload) {
        return await prisma_1.prisma.skripsi.create({
            data: {
                mahasiswa_id: BigInt(payload.mahasiswa_id),
                ranpel_id: BigInt(payload.ranpel_id),
                judul: payload.judul,
                pembimbing_1: BigInt(payload.pembimbing_1),
                pembimbing_2: payload.pembimbing_2
                    ? BigInt(payload.pembimbing_2)
                    : null,
                status: "berjalan",
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = { ...payload, updated_at: new Date() };
        if (payload.mahasiswa_id)
            dataUpdate.mahasiswa_id = BigInt(payload.mahasiswa_id);
        if (payload.ranpel_id)
            dataUpdate.ranpel_id = BigInt(payload.ranpel_id);
        if (payload.pembimbing_1)
            dataUpdate.pembimbing_1 = BigInt(payload.pembimbing_1);
        if (payload.pembimbing_2 !== undefined) {
            dataUpdate.pembimbing_2 = payload.pembimbing_2
                ? BigInt(payload.pembimbing_2)
                : null;
        }
        return await prisma_1.prisma.skripsi.update({
            where: { id: BigInt(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.skripsi.delete({ where: { id: BigInt(id) } });
    }
}
exports.SkripsiService = SkripsiService;
exports.skripsiService = new SkripsiService();
