"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pemenuhanSyaratService = exports.PemenuhanSyaratService = void 0;
const prisma_1 = require("../utils/prisma");
class PemenuhanSyaratService {
    async getAll() {
        return await prisma_1.prisma.pemenuhanSyarat.findMany();
    }
    async getById(id) {
        const [pendaftaranUjianId, syaratId] = id.split("_");
        return await prisma_1.prisma.pemenuhanSyarat.findUnique({
            where: {
                pendaftaranUjianId_syaratId: {
                    pendaftaranUjianId: Number(pendaftaranUjianId),
                    syaratId: Number(syaratId),
                },
            },
        });
    }
    async store(payload) {
        console.log(payload);
        return await prisma_1.prisma.pemenuhanSyarat.create({
            data: {
                pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
                syaratId: Number(payload.syarat_id),
                terpenuhi: payload.status === "terverifikasi" ||
                    payload.status === "terpenuhi" ||
                    payload.terpenuhi,
                fileBukti: payload.file_path,
                keterangan: payload.keterangan || null,
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = {};
        if (payload.pendaftaran_ujian_id !== undefined)
            dataUpdate.pendaftaranUjianId = payload.pendaftaran_ujian_id
                ? Number(payload.pendaftaran_ujian_id)
                : null;
        if (payload.syarat_id !== undefined)
            dataUpdate.syaratId = payload.syarat_id
                ? Number(payload.syarat_id)
                : null;
        if (payload.status !== undefined) {
            dataUpdate.terpenuhi =
                payload.status === "terverifikasi" ||
                    payload.status === "terpenuhi" ||
                    payload.terpenuhi;
        }
        if (payload.file_path !== undefined)
            dataUpdate.fileBukti = payload.file_path;
        if (payload.keterangan !== undefined)
            dataUpdate.keterangan = payload.keterangan;
        const [pendaftaranUjianId, syaratId] = id.split("_");
        return await prisma_1.prisma.pemenuhanSyarat.update({
            where: {
                pendaftaranUjianId_syaratId: {
                    pendaftaranUjianId: Number(pendaftaranUjianId),
                    syaratId: Number(syaratId),
                },
            },
            data: dataUpdate,
        });
    }
    async delete(id) {
        const [pendaftaranUjianId, syaratId] = id.split("_");
        return await prisma_1.prisma.pemenuhanSyarat.delete({
            where: {
                pendaftaranUjianId_syaratId: {
                    pendaftaranUjianId: Number(pendaftaranUjianId),
                    syaratId: Number(syaratId),
                },
            },
        });
    }
}
exports.PemenuhanSyaratService = PemenuhanSyaratService;
exports.pemenuhanSyaratService = new PemenuhanSyaratService();
