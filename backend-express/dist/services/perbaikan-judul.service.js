"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perbaikanJudulService = exports.PerbaikanJudulService = void 0;
const prisma_1 = require("../utils/prisma");
class PerbaikanJudulService {
    async getAll() {
        return await prisma_1.prisma.perbaikan_judul.findMany({
            include: { mahasiswa: true, ranpel: true },
        });
    }
    async store(payload, files) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const ranpel = await tx.ranpel.findUnique({
                where: { id: BigInt(payload.ranpel_id) },
            });
            if (!ranpel)
                throw new Error("Ranpel tidak ditemukan");
            const terakhirDiterima = await tx.perbaikan_judul.findFirst({
                where: {
                    ranpel_id: BigInt(payload.ranpel_id),
                    mahasiswa_id: BigInt(payload.mahasiswa_id),
                    status: "diterima",
                },
                orderBy: [{ tanggal_perbaikan: "desc" }, { id: "desc" }],
            });
            const judul_lama = terakhirDiterima?.judul_baru ?? ranpel.judul_penelitian;
            let fileUrl = "";
            if (files && files.length > 0) {
                // Just take the first one since schema only needs 1 berkas string
                fileUrl = `http://localhost:3000/storage/perbaikan_judul/${files[0].filename}`;
            }
            const perbaikan = await tx.perbaikan_judul.create({
                data: {
                    ranpel_id: BigInt(payload.ranpel_id),
                    mahasiswa_id: BigInt(payload.mahasiswa_id),
                    judul_lama,
                    judul_baru: payload.judul_baru,
                    berkas: fileUrl,
                    status: "menunggu",
                    tanggal_perbaikan: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                include: { mahasiswa: true, ranpel: true },
            });
            return perbaikan;
        });
    }
    async update(id, payload, files) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const perbaikan = await tx.perbaikan_judul.findUnique({
                where: { id: BigInt(id) },
            });
            if (!perbaikan)
                throw new Error("Perbaikan judul tida ditemukan");
            const dataUpdate = { ...payload, updated_at: new Date() };
            if (files && files.length > 0) {
                dataUpdate.berkas = `http://localhost:3000/storage/perbaikan_judul/${files[0].filename}`;
            }
            if (payload.status === "diterima") {
                if (!perbaikan.tanggal_diterima) {
                    dataUpdate.tanggal_diterima = new Date();
                }
                const judulBaruUpdate = payload.judul_baru ?? perbaikan.judul_baru;
                if (judulBaruUpdate) {
                    await tx.ranpel.update({
                        where: { id: perbaikan.ranpel_id },
                        data: { judul_penelitian: judulBaruUpdate },
                    });
                }
            }
            return await tx.perbaikan_judul.update({
                where: { id: BigInt(id) },
                data: dataUpdate,
                include: { mahasiswa: true, ranpel: true },
            });
        });
    }
    async delete(id) {
        return await prisma_1.prisma.perbaikan_judul.delete({ where: { id: BigInt(id) } });
    }
    async getByMahasiswa(mahasiswaId) {
        return await prisma_1.prisma.perbaikan_judul.findMany({
            where: { mahasiswa_id: BigInt(mahasiswaId) },
            include: { mahasiswa: true, ranpel: true },
            orderBy: { created_at: "desc" },
        });
    }
    async getByPembimbing(dosenId) {
        return await prisma_1.prisma.perbaikan_judul.findMany({
            where: {
                mahasiswa: {
                    OR: [
                        { pembimbing_1: BigInt(dosenId) },
                        { pembimbing_2: BigInt(dosenId) },
                    ],
                },
            },
            include: { mahasiswa: true, ranpel: true },
            orderBy: { created_at: "desc" },
        });
    }
}
exports.PerbaikanJudulService = PerbaikanJudulService;
exports.perbaikanJudulService = new PerbaikanJudulService();
