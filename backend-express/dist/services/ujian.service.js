"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ujianService = exports.UjianService = void 0;
const prisma_1 = require("../utils/prisma");
class UjianService {
    async getAll() {
        return await prisma_1.prisma.ujian.findMany({
            include: {
                pendaftaranUjian: {
                    include: {
                        rancanganPenelitian: true,
                        mahasiswa: true,
                        jenisUjian: true,
                    },
                },
                ruangan: true,
                pengujiUjians: { include: { dosen: true } },
                keputusan: true,
            },
        });
    }
    async getById(id) {
        return await prisma_1.prisma.ujian.findUnique({
            where: { id: Number(id) },
            include: {
                pendaftaranUjian: {
                    include: {
                        rancanganPenelitian: true,
                        mahasiswa: true,
                        jenisUjian: true,
                    },
                },
                ruangan: true,
                pengujiUjians: { include: { dosen: true } },
                keputusan: true,
            },
        });
    }
    async getByMahasiswa(mahasiswaId, namaJenis) {
        return await prisma_1.prisma.ujian.findMany({
            where: {
                pendaftaranUjian: {
                    mahasiswaId: Number(mahasiswaId),
                    ...(namaJenis && {
                        jenis_ujian: {
                            namaJenis: { contains: namaJenis },
                        },
                    }),
                },
            },
            include: {
                pendaftaranUjian: {
                    include: {
                        rancanganPenelitian: true,
                        mahasiswa: true,
                        jenisUjian: true,
                    },
                },
                ruangan: true,
                pengujiUjians: { include: { dosen: true } },
                keputusan: true,
            },
            orderBy: { id: "desc" },
        });
    }
    async store(payload) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            let ruanganId = null;
            if (payload.ruangan_id)
                ruanganId = Number(payload.ruangan_id);
            let keputusanId = null;
            if (payload.keputusan_id)
                keputusanId = Number(payload.keputusan_id);
            const ujian = await tx.ujian.create({
                data: {
                    pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
                    hariUjian: payload.hari_ujian,
                    jadwalUjian: payload.jadwal_ujian
                        ? new Date(payload.jadwal_ujian)
                        : null,
                    waktuMulai: payload.waktu_mulai
                        ? new Date(payload.waktu_mulai)
                        : null,
                    waktuSelesai: payload.waktu_selesai
                        ? new Date(payload.waktu_selesai)
                        : null,
                    ruanganId: ruanganId,
                    keputusanId: keputusanId,
                },
            });
            if (payload.penguji && payload.penguji.length > 0) {
                const syncData = payload.penguji.map((p) => ({
                    ujianId: ujian.id,
                    dosenId: Number(p.dosenId),
                    peran: p.peran,
                }));
                await tx.pengujiUjian.createMany({ data: syncData });
            }
            return await tx.ujian.findUnique({
                where: { id: ujian.id },
                include: { pengujiUjians: true, pendaftaranUjian: true },
            });
        });
    }
    async update(id, payload) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const ujian = await tx.ujian.findUnique({ where: { id: Number(id) } });
            if (!ujian)
                throw new Error("Ujian tidak ditemukan");
            const dataUpdate = { ...payload };
            delete dataUpdate.penguji; // hapus relasional input arraynya
            delete dataUpdate.mahasiswaId;
            delete dataUpdate.jenisUjianId;
            if (payload.ruangan_id)
                dataUpdate.ruanganId = Number(payload.ruangan_id);
            if (payload.keputusan_id)
                dataUpdate.keputusanId = Number(payload.keputusan_id);
            if (payload.hari_ujian)
                dataUpdate.hariUjian = payload.hari_ujian;
            if (payload.jadwal_ujian)
                dataUpdate.jadwalUjian = new Date(payload.jadwal_ujian);
            if (payload.waktu_mulai)
                dataUpdate.waktuMulai = new Date(payload.waktu_mulai);
            if (payload.waktu_selesai)
                dataUpdate.waktuSelesai = new Date(payload.waktu_selesai);
            // Auto set hasil kalau dikirim nilaiAkhir tapi gak ada hasil
            if (payload.nilai_akhir !== undefined && payload.hasil === undefined) {
                dataUpdate.hasil =
                    Number(payload.nilai_akhir) >= 70 ? "lulus" : "tidak_lulus";
            }
            const updatedUjian = await tx.ujian.update({
                where: { id: Number(id) },
                data: dataUpdate,
            });
            // update status pendaftaran jika jadwal disediakan
            if (payload.jadwal_ujian &&
                payload.jadwal_ujian !== ujian.jadwalUjian?.toISOString()) {
                await tx.ujian.update({
                    where: { id: ujian.id },
                    data: { status: "dijadwalkan" },
                });
            }
            if (payload.penguji) {
                // Sync operation: hapus dan insert
                await tx.pengujiUjian.deleteMany({ where: { ujianId: Number(id) } });
                const syncData = payload.penguji.map((p) => ({
                    ujianId: ujian.id,
                    dosenId: Number(p.dosenId),
                    peran: p.peran,
                }));
                await tx.pengujiUjian.createMany({ data: syncData });
            }
            return await tx.ujian.findUnique({
                where: { id: Number(id) },
                include: {
                    pengujiUjians: true,
                    pendaftaranUjian: { include: { mahasiswa: true } },
                },
            });
        });
    }
    async delete(id) {
        return await prisma_1.prisma.ujian.delete({ where: { id: Number(id) } });
    }
    // Pure logic pemindahan dari model Ujian.php Laravel -> hitungNilaiAkhir()
    async hitungNilaiAkhir(ujianId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const ujian = await tx.ujian.findUnique({
                where: { id: ujianId },
                include: { pendaftaranUjian: { include: { jenisUjian: true } } },
            });
            if (!ujian || !ujian.pendaftaranUjian?.jenisUjian)
                return null;
            const penilaian = await tx.penilaian.findMany({
                where: { ujianId: ujianId },
                include: { komponenPenilaian: true },
            });
            if (penilaian.length === 0)
                return null;
            // Kelompokkan berdasar dosen
            const dosenGroups = new Map();
            for (const p of penilaian) {
                const dId = p.dosenId.toString();
                if (!dosenGroups.has(dId))
                    dosenGroups.set(dId, []);
                dosenGroups.get(dId)?.push(p);
            }
            // Hitung total tiap dosen
            let sumRataRata = 0;
            let dividerCount = 0;
            for (const [_, items] of dosenGroups.entries()) {
                let totalBobot = 0;
                let sumNilaiBobot = 0;
                for (const item of items) {
                    const bobot = 1; // TODO: Fetch bobot from BobotKomponenPeran model based on dosen role
                    const nilai = Number(item.nilai);
                    totalBobot += bobot;
                    sumNilaiBobot += nilai * bobot;
                }
                if (totalBobot > 0) {
                    const avgDosen = sumNilaiBobot / totalBobot;
                    sumRataRata += avgDosen;
                    dividerCount++;
                }
            }
            if (dividerCount === 0)
                return null;
            const nilaiAkhir = sumRataRata / dividerCount;
            let isLulus = nilaiAkhir >= 70;
            // Cek threshold <= 60 untuk proposal, hasil, skripsi
            const targetExams = ["proposal", "hasil"];
            const jenisLower = ujian.pendaftaranUjian?.jenisUjian?.namaJenis?.toLowerCase() || "";
            const isTargetExam = targetExams.some((t) => jenisLower.includes(t));
            if (isTargetExam) {
                const hasLowScore = penilaian.some((p) => Number(p.nilai) <= 60);
                if (hasLowScore)
                    isLulus = false;
            }
            await tx.ujian.update({
                where: { id: ujianId },
                data: {
                    nilaiAkhir: nilaiAkhir,
                    hasil: isLulus ? "lulus" : "tidak_lulus",
                },
            });
            return await tx.ujian.findUnique({ where: { id: ujianId } });
        });
    }
}
exports.UjianService = UjianService;
exports.ujianService = new UjianService();
