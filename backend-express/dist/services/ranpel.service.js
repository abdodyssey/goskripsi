"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ranpelService = exports.RanpelService = void 0;
const prisma_1 = require("../utils/prisma");
class RanpelService {
    async getAllRanpel() {
        return await prisma_1.prisma.rancanganPenelitian.findMany();
    }
    async getAllPengajuan(userId, roles = []) {
        const where = {};
        // Logic: If user is Dosen but not Kaprodi/Sekprodi/Admin, filter by Dosen PA
        const isManagement = roles.some((r) => ["admin", "superadmin", "kaprodi", "sekprodi"].includes(r));
        if (userId && roles.includes("dosen") && !isManagement) {
            where.mahasiswa = {
                dosen_pa: Number(userId),
            };
        }
        return await prisma_1.prisma.pengajuanRancanganPenelitian.findMany({
            where,
            include: {
                rancanganPenelitian: true,
                mahasiswa: {
                    include: {
                        prodi: true,
                        peminatan: true,
                        pembimbing1Rel: true,
                        pembimbing2Rel: true,
                        dosenPaRel: true,
                    },
                },
            },
            orderBy: { tanggalPengajuan: "desc" },
        });
    }
    async storeRanpel(payload) {
        return await prisma_1.prisma.rancanganPenelitian.create({
            data: {
                mahasiswaId: Number(payload.mahasiswa_id),
                judulPenelitian: payload.judul_penelitian,
                masalahDanPenyebab: payload.masalah_dan_penyebab,
                alternatifSolusi: payload.alternatif_solusi,
                metodePenelitian: payload.metode_penelitian,
                hasilYangDiharapkan: payload.hasil_yang_diharapkan,
                kebutuhanData: payload.kebutuhan_data,
                jurnalReferensi: payload.jurnal_referensi,
            },
        });
    }
    async storeByMahasiswa(payload, mahasiswaId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const rancanganPenelitian = await tx.rancanganPenelitian.create({
                data: {
                    mahasiswaId: Number(mahasiswaId),
                    judulPenelitian: payload.judul_penelitian,
                    masalahDanPenyebab: payload.masalah_dan_penyebab,
                    alternatifSolusi: payload.alternatif_solusi,
                    metodePenelitian: payload.metode_penelitian,
                    hasilYangDiharapkan: payload.hasil_yang_diharapkan,
                    kebutuhanData: payload.kebutuhan_data,
                    jurnalReferensi: payload.jurnal_referensi,
                },
            });
            await tx.pengajuanRancanganPenelitian.create({
                data: {
                    rancanganPenelitianId: rancanganPenelitian.id,
                    mahasiswaId: Number(mahasiswaId),
                    tanggalPengajuan: new Date(),
                    statusDosenPa: "menunggu",
                    catatanDosenPa: "",
                    statusKaprodi: "menunggu",
                    catatanKaprodi: "",
                },
            });
            return rancanganPenelitian;
        });
    }
    async updateRanpelByMahasiswa(rancanganPenelitianId, payload) {
        const dataUpdate = {};
        if (payload.judul_penelitian !== undefined)
            dataUpdate.judulPenelitian = payload.judul_penelitian;
        if (payload.masalah_dan_penyebab !== undefined)
            dataUpdate.masalahDanPenyebab = payload.masalah_dan_penyebab;
        if (payload.alternatif_solusi !== undefined)
            dataUpdate.alternatifSolusi = payload.alternatif_solusi;
        if (payload.metode_penelitian !== undefined)
            dataUpdate.metodePenelitian = payload.metode_penelitian;
        if (payload.hasil_yang_diharapkan !== undefined)
            dataUpdate.hasilYangDiharapkan = payload.hasil_yang_diharapkan;
        if (payload.kebutuhan_data !== undefined)
            dataUpdate.kebutuhanData = payload.kebutuhan_data;
        if (payload.jurnal_referensi !== undefined)
            dataUpdate.jurnalReferensi = payload.jurnal_referensi;
        return await prisma_1.prisma.rancanganPenelitian.update({
            where: { id: Number(rancanganPenelitianId) },
            data: dataUpdate,
        });
    }
    async updatePengajuan(pengajuanId, payload) {
        const dataUpdate = {};
        if (payload.status === "diterima") {
            dataUpdate.statusDosenPa = "diterima";
            dataUpdate.tanggalReviewPa = new Date();
        }
        else if (payload.status === "ditolak") {
            dataUpdate.statusDosenPa = "ditolak";
            dataUpdate.tanggalReviewPa = new Date();
        }
        else if (payload.status === "menunggu") {
            dataUpdate.statusDosenPa = "menunggu";
            dataUpdate.tanggalReviewPa = null;
        }
        if (payload.catatan_kaprodi) {
            dataUpdate.catatanKaprodi = payload.catatan_kaprodi;
        }
        if (payload.keterangan) {
            dataUpdate.catatanDosenPa = payload.keterangan;
        }
        return await prisma_1.prisma.pengajuanRancanganPenelitian.update({
            where: { id: Number(pengajuanId) },
            data: dataUpdate,
            include: { rancanganPenelitian: true, mahasiswa: true },
        });
    }
    async getPengajuanByMahasiswa(mahasiswaId) {
        return await prisma_1.prisma.pengajuanRancanganPenelitian.findMany({
            where: { mahasiswaId: Number(mahasiswaId) },
            include: {
                rancanganPenelitian: true,
                mahasiswa: {
                    include: {
                        prodi: true,
                        dosenPaRel: true,
                    },
                },
            },
        });
    }
    async getPengajuanById(id) {
        return await prisma_1.prisma.pengajuanRancanganPenelitian.findUnique({
            where: { id: Number(id) },
            include: {
                rancanganPenelitian: true,
                mahasiswa: {
                    include: {
                        prodi: true,
                        dosenPaRel: true,
                    },
                },
            },
        });
    }
    async deleteRanpel(id) {
        return await prisma_1.prisma.rancanganPenelitian.delete({
            where: { id: Number(id) },
        });
    }
    async deletePengajuan(id) {
        return await prisma_1.prisma.pengajuanRancanganPenelitian.delete({
            where: { id: Number(id) },
        });
    }
}
exports.RanpelService = RanpelService;
exports.ranpelService = new RanpelService();
