"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dosenService = exports.DosenService = void 0;
const prisma_1 = require("../utils/prisma");
class DosenService {
    async getAll(userId) {
        const whereClause = userId
            ? { id: Number(userId) }
            : {};
        const list = await prisma_1.prisma.dosen.findMany({
            where: whereClause,
            include: {
                prodi: true,
                user: { select: { id: true, email: true, nama: true } },
            },
        });
        return list.map((d) => this.transformDosen(d));
    }
    async getById(id) {
        const dosen = await prisma_1.prisma.dosen.findUnique({
            where: { id: Number(id) },
            include: {
                prodi: true,
                user: { select: { id: true, email: true, nama: true } },
            },
        });
        if (!dosen)
            throw new Error("Dosen not found");
        return this.transformDosen(dosen);
    }
    async create(payload) {
        const statusMap = {
            aktif: "aktif",
            tidak_aktif: "tidak aktif",
            "tidak aktif": "tidak aktif",
        };
        const mappedStatus = statusMap[payload.status] || "aktif";
        const result = await prisma_1.prisma.dosen.create({
            data: {
                nidn: payload.nidn,
                nip: payload.nip,
                noHp: payload.no_hp,
                alamat: payload.alamat,
                tempatTanggalLahir: payload.tempat_tanggal_lahir,
                pangkat: payload.pangkat,
                golongan: payload.golongan,
                jabatan: payload.jabatan,
                status: mappedStatus,
                prodiId: Number(payload.prodi_id),
                email: payload.email,
                id: payload.user_id ? Number(payload.user_id) : undefined,
            },
        });
        return this.transformDosen(result);
    }
    async update(id, payload, ttdUrl) {
        const statusMap = {
            aktif: "aktif",
            tidak_aktif: "tidak_aktif",
            "tidak aktif": "tidak_aktif",
        };
        const dataToUpdate = {};
        if (payload.nidn !== undefined)
            dataToUpdate.nidn = payload.nidn;
        if (payload.nip !== undefined)
            dataToUpdate.nip = payload.nip;
        if (payload.alamat !== undefined)
            dataToUpdate.alamat = payload.alamat;
        if (payload.pangkat !== undefined)
            dataToUpdate.pangkat = payload.pangkat;
        if (payload.golongan !== undefined)
            dataToUpdate.golongan = payload.golongan;
        if (payload.jabatan !== undefined)
            dataToUpdate.jabatan = payload.jabatan;
        if (payload.email !== undefined)
            dataToUpdate.email = payload.email;
        if (payload.no_hp !== undefined)
            dataToUpdate.noHp = payload.no_hp;
        if (payload.tempat_tanggal_lahir !== undefined)
            dataToUpdate.tempatTanggalLahir = payload.tempat_tanggal_lahir;
        if (payload.prodi_id !== undefined)
            dataToUpdate.prodi = { connect: { id: Number(payload.prodi_id) } };
        if (payload.status !== undefined) {
            dataToUpdate.status =
                statusMap[payload.status] || "aktif";
        }
        if (ttdUrl)
            dataToUpdate.urlTtd = ttdUrl;
        const result = await prisma_1.prisma.dosen.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: {
                prodi: true,
                user: { select: { id: true, email: true, nama: true } },
            },
        });
        return this.transformDosen(result);
    }
    async delete(id) {
        return await prisma_1.prisma.dosen.delete({ where: { id: Number(id) } });
    }
    transformDosen(d) {
        if (!d)
            return null;
        return {
            id: d.id,
            nidn: d.nidn,
            nip: d.nip,
            nama: d.user?.nama,
            email: d.user?.email || d.email,
            noHp: d.noHp,
            alamat: d.alamat,
            tempatTanggalLahir: d.tempatTanggalLahir,
            pangkat: d.pangkat,
            golongan: d.golongan,
            jabatan: d.jabatan,
            status: d.status,
            prodiId: d.prodiId,
            prodi: this.transformProdi(d.prodi),
            urlTtd: d.urlTtd,
            foto: d.foto,
            // legacy support
            no_hp: d.noHp,
            tempat_tanggal_lahir: d.tempatTanggalLahir,
            prodi_id: d.prodiId,
            url_ttd: d.urlTtd,
        };
    }
    transformProdi(p) {
        if (!p)
            return null;
        return {
            id: p.id,
            namaProdi: p.namaProdi,
            fakultasId: p.fakultasId,
            // legacy
            nama_prodi: p.namaProdi,
            fakultas_id: p.fakultasId,
        };
    }
}
exports.DosenService = DosenService;
exports.dosenService = new DosenService();
