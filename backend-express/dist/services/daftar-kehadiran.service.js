"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daftarKehadiranService = exports.DaftarKehadiranService = void 0;
const prisma_1 = require("../utils/prisma");
class DaftarKehadiranService {
    async getAll() {
        return await prisma_1.prisma.daftar_kehadiran.findMany();
    }
    async getById(id) {
        const [ujianId, dosenId] = id.split("_");
        return await prisma_1.prisma.daftar_kehadiran.findUnique({
            where: {
                ujian_id_dosen_id: {
                    ujian_id: BigInt(ujianId),
                    dosen_id: BigInt(dosenId),
                },
            },
        });
    }
    async store(payload) {
        return await prisma_1.prisma.daftar_kehadiran.create({
            data: {
                ujian_id: BigInt(payload.ujian_id),
                dosen_id: BigInt(payload.dosen_id),
                status_kehadiran: payload.status_kehadiran,
                keterangan: payload.catatan || null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = { updated_at: new Date() };
        if (payload.ujian_id !== undefined)
            dataUpdate.ujian_id = payload.ujian_id ? BigInt(payload.ujian_id) : null;
        if (payload.dosen_id !== undefined)
            dataUpdate.dosen_id = payload.dosen_id ? BigInt(payload.dosen_id) : null;
        if (payload.status_kehadiran !== undefined)
            dataUpdate.status_kehadiran = payload.status_kehadiran;
        if (payload.catatan !== undefined)
            dataUpdate.keterangan = payload.catatan;
        const [ujianId, dosenId] = id.split("_");
        return await prisma_1.prisma.daftar_kehadiran.update({
            where: {
                ujian_id_dosen_id: {
                    ujian_id: BigInt(ujianId),
                    dosen_id: BigInt(dosenId),
                },
            },
            data: dataUpdate,
        });
    }
    async delete(id) {
        const [ujianId, dosenId] = id.split("_");
        return await prisma_1.prisma.daftar_kehadiran.delete({
            where: {
                ujian_id_dosen_id: {
                    ujian_id: BigInt(ujianId),
                    dosen_id: BigInt(dosenId),
                },
            },
        });
    }
}
exports.DaftarKehadiranService = DaftarKehadiranService;
exports.daftarKehadiranService = new DaftarKehadiranService();
