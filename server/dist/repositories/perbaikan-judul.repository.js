"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerbaikanJudulRepository = void 0;
const prisma_1 = require("../utils/prisma");
class PerbaikanJudulRepository {
    async create(data) {
        return prisma_1.prisma.perbaikanJudul.create({
            data: {
                mahasiswaId: data.mahasiswaId,
                judulLama: data.judulLama,
                judulBaru: data.judulBaru,
                fileSurat: data.fileSurat,
                status: 'menunggu',
            },
        });
    }
    async findAll() {
        return prisma_1.prisma.perbaikanJudul.findMany({
            include: {
                mahasiswa: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                tanggalPengajuan: 'desc',
            },
        });
    }
    async findByMahasiswaId(mahasiswaId) {
        return prisma_1.prisma.perbaikanJudul.findMany({
            where: { mahasiswaId },
            orderBy: {
                tanggalPengajuan: 'desc',
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.perbaikanJudul.findFirst({
            where: { id },
            include: {
                mahasiswa: true,
            },
        });
    }
    async updateStatus(id, data) {
        return prisma_1.prisma.perbaikanJudul.update({
            where: { id },
            data: {
                status: data.status,
                catatanSekprodi: data.catatanSekprodi,
                tanggalReview: new Date(),
            },
        });
    }
    async updateMahasiswaTitle(mahasiswaId, newTitle) {
        // Usually title is in RancanganPenelitian.
        // We update the LATEST accepted RancanganPenelitian for this student.
        const latestRanpel = await prisma_1.prisma.rancanganPenelitian.findFirst({
            where: {
                mahasiswaId,
                pengajuanRancanganPenelitians: {
                    some: {
                        statusKaprodi: 'diterima',
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });
        if (latestRanpel) {
            return prisma_1.prisma.rancanganPenelitian.update({
                where: { id: latestRanpel.id },
                data: { judulPenelitian: newTitle },
            });
        }
        return null;
    }
}
exports.PerbaikanJudulRepository = PerbaikanJudulRepository;
