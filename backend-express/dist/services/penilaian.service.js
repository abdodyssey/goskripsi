"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.penilaianService = exports.PenilaianService = void 0;
const prisma_1 = require("../utils/prisma");
const ujian_service_1 = require("./ujian.service");
class PenilaianService {
    async getAll() {
        return await prisma_1.prisma.penilaian.findMany({
            include: {
                ujian: true,
                dosen: true,
                komponenPenilaian: true,
            },
        });
    }
    async getById(id) {
        const [ujianId, dosenId, komponenPenilaianId] = id.split("_");
        return await prisma_1.prisma.penilaian.findUnique({
            where: {
                ujianId_dosenId_komponenPenilaianId: {
                    ujianId: Number(ujianId),
                    dosenId: Number(dosenId),
                    komponenPenilaianId: Number(komponenPenilaianId),
                },
            },
            include: {
                ujian: true,
                dosen: true,
                komponenPenilaian: true,
            },
        });
    }
    async store(payload) {
        if ("data" in payload && Array.isArray(payload.data)) {
            // ✅ BATCH INSERT
            return await prisma_1.prisma.$transaction(async (tx) => {
                const createData = payload.data.map((item) => ({
                    ujianId: Number(item.ujian_id),
                    dosenId: Number(item.dosen_id),
                    komponenPenilaianId: Number(item.komponen_penilaian_id),
                    nilai: item.nilai,
                    komentar: item.komentar || null,
                }));
                await tx.penilaian.createMany({ data: createData });
                const ujianIds = [
                    ...new Set(payload.data.map((item) => Number(item.ujian_id))),
                ];
                for (const uId of ujianIds) {
                    await ujian_service_1.ujianService.hitungNilaiAkhir(Number(uId));
                }
                return await tx.penilaian.findMany({
                    where: {
                        ujianId: { in: ujianIds.map((uId) => Number(uId)) },
                    },
                });
            });
        }
        // ✅ SINGLE INSERT
        return await prisma_1.prisma.$transaction(async (tx) => {
            if (!("ujian_id" in payload))
                throw new Error("Invalid payload");
            const penilaian = await tx.penilaian.create({
                data: {
                    ujianId: Number(payload.ujian_id),
                    dosenId: Number(payload.dosen_id),
                    komponenPenilaianId: Number(payload.komponen_penilaian_id),
                    nilai: payload.nilai,
                    komentar: payload.komentar || null,
                },
            });
            await ujian_service_1.ujianService.hitungNilaiAkhir(penilaian.ujianId);
            return penilaian;
        });
    }
    async update(id, payload) {
        if ("data" in payload && Array.isArray(payload.data)) {
            // ✅ BATCH UPDATE
            return await prisma_1.prisma.$transaction(async (tx) => {
                const ujianIds = new Set();
                for (const item of payload.data) {
                    const [uId, dId, kId] = typeof item.id === "string"
                        ? item.id.split("_")
                        : [
                            String(item.ujian_id),
                            String(item.dosen_id),
                            String(item.komponen_penilaian_id),
                        ];
                    const rec = await tx.penilaian.update({
                        where: {
                            ujianId_dosenId_komponenPenilaianId: {
                                ujianId: Number(uId),
                                dosenId: Number(dId),
                                komponenPenilaianId: Number(kId),
                            },
                        },
                        data: {
                            nilai: item.nilai,
                            komentar: item.komentar || null,
                        },
                    });
                    ujianIds.add(rec.ujianId);
                }
                for (const uId of ujianIds) {
                    await ujian_service_1.ujianService.hitungNilaiAkhir(uId);
                }
                return Array.from(ujianIds);
            });
        }
        // ✅ SINGLE UPDATE
        return await prisma_1.prisma.$transaction(async (tx) => {
            if (!id)
                throw new Error("ID parameter required for single update");
            const [uId, dId, kId] = id.split("_");
            const dataUpdate = { ...payload };
            delete dataUpdate.id; // Just in case
            dataUpdate.updated_at = new Date();
            const penilaian = await tx.penilaian.update({
                where: {
                    ujianId_dosenId_komponenPenilaianId: {
                        ujianId: Number(uId),
                        dosenId: Number(dId),
                        komponenPenilaianId: Number(kId),
                    },
                },
                data: dataUpdate,
            });
            await ujian_service_1.ujianService.hitungNilaiAkhir(penilaian.ujianId);
            return penilaian;
        });
    }
    async delete(id) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const [uId, dId, kId] = id.split("_");
            const penilaian = await tx.penilaian.findUnique({
                where: {
                    ujianId_dosenId_komponenPenilaianId: {
                        ujianId: Number(uId),
                        dosenId: Number(dId),
                        komponenPenilaianId: Number(kId),
                    },
                },
            });
            if (!penilaian)
                throw new Error("Penilaian tidak ditemukan");
            const ujianId = penilaian.ujianId;
            await tx.penilaian.delete({
                where: {
                    ujianId_dosenId_komponenPenilaianId: {
                        ujianId: Number(uId),
                        dosenId: Number(dId),
                        komponenPenilaianId: Number(kId),
                    },
                },
            });
            await ujian_service_1.ujianService.hitungNilaiAkhir(ujianId);
            return true;
        });
    }
}
exports.PenilaianService = PenilaianService;
exports.penilaianService = new PenilaianService();
