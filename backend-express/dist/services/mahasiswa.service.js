"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mahasiswaService = exports.MahasiswaService = void 0;
const prisma_1 = require("../utils/prisma");
const client_1 = require("@prisma/client");
class MahasiswaService {
    async getAll(userId) {
        const whereClause = userId
            ? { id: Number(userId) }
            : {};
        return await prisma_1.prisma.mahasiswa.findMany({
            where: whereClause,
            include: {
                prodi: true,
                peminatan: true,
                user: { select: { id: true, email: true, nama: true } },
                pembimbing1Rel: {
                    select: { id: true, user: { select: { nama: true } } },
                }, // Equivalent of pembimbing1
                pembimbing2Rel: {
                    select: { id: true, user: { select: { nama: true } } },
                }, // Equivalent of pembimbing2
            },
        });
    }
    async getById(id) {
        const mahasiswa = await prisma_1.prisma.mahasiswa.findUnique({
            where: { id: Number(id) },
            include: {
                prodi: true,
                peminatan: true,
                user: { select: { id: true, email: true, nama: true } },
                pembimbing1Rel: {
                    select: { id: true, user: { select: { nama: true } } },
                },
                pembimbing2Rel: {
                    select: { id: true, user: { select: { nama: true } } },
                },
            },
        });
        if (!mahasiswa)
            throw new Error("Mahasiswa not found");
        return mahasiswa;
    }
    async create(payload) {
        return await prisma_1.prisma.mahasiswa.create({
            data: {
                nim: payload.nim,
                noHp: payload.no_hp,
                alamat: payload.alamat,
                prodiId: Number(payload.prodi_id),
                peminatanId: payload.peminatan_id ? Number(payload.peminatan_id) : null,
                semester: payload.semester,
                ipk: new client_1.Prisma.Decimal(payload.ipk),
                dosenPa: payload.dosen_pa ? Number(payload.dosen_pa) : null,
                pembimbing1: payload.pembimbing_1 ? Number(payload.pembimbing_1) : null,
                pembimbing2: payload.pembimbing_2 ? Number(payload.pembimbing_2) : null,
                status: payload.status,
                angkatan: payload.angkatan,
                id: Number(payload.user_id),
            },
        });
    }
    async update(id, payload, fileUrl) {
        const dataToUpdate = {};
        if (payload.nim !== undefined)
            dataToUpdate.nim = payload.nim;
        if (payload.no_hp !== undefined)
            dataToUpdate.noHp = payload.no_hp;
        if (payload.alamat !== undefined)
            dataToUpdate.alamat = payload.alamat;
        if (payload.semester !== undefined)
            dataToUpdate.semester = payload.semester;
        if (payload.status !== undefined)
            dataToUpdate.status = payload.status;
        if (payload.angkatan !== undefined)
            dataToUpdate.angkatan = payload.angkatan;
        if (payload.prodi_id !== undefined)
            dataToUpdate.prodi = { connect: { id: Number(payload.prodi_id) } };
        if (payload.peminatan_id !== undefined)
            dataToUpdate.peminatan = payload.peminatan_id
                ? { connect: { id: Number(payload.peminatan_id) } }
                : { disconnect: true };
        if (payload.dosen_pa !== undefined)
            dataToUpdate.dosenPaRel = payload.dosen_pa
                ? { connect: { id: Number(payload.dosen_pa) } }
                : { disconnect: true };
        if (payload.pembimbing_1 !== undefined)
            dataToUpdate.pembimbing1Rel = payload.pembimbing_1
                ? { connect: { id: Number(payload.pembimbing_1) } }
                : { disconnect: true };
        if (payload.pembimbing_2 !== undefined)
            dataToUpdate.pembimbing2Rel = payload.pembimbing_2
                ? { connect: { id: Number(payload.pembimbing_2) } }
                : { disconnect: true };
        if (payload.ipk !== undefined)
            dataToUpdate.ipk = new client_1.Prisma.Decimal(payload.ipk);
        if (fileUrl)
            dataToUpdate.foto = fileUrl;
        return await prisma_1.prisma.mahasiswa.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: { prodi: true, peminatan: true },
        });
    }
    async delete(id) {
        return await prisma_1.prisma.mahasiswa.delete({ where: { id: Number(id) } });
    }
}
exports.MahasiswaService = MahasiswaService;
exports.mahasiswaService = new MahasiswaService();
