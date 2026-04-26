"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendaftaranUjianService = exports.PendaftaranUjianService = void 0;
const prisma_1 = require("../utils/prisma");
const http_error_1 = require("../utils/http-error");
const supabase_1 = require("../utils/supabase");
const path_1 = __importDefault(require("path"));
const BUCKET = "skripsi_docs";
/**
 * Upload a file to Supabase Storage under submissions/[NIM]/
 */
async function uploadToSupabase(file, nim) {
    // Sanitize the original file name (which is the syarat name from frontend)
    const ext = path_1.default.extname(file.originalname) || ".pdf";
    const rawName = path_1.default.basename(file.originalname, ext);
    // Remove ALL non-alphanumeric chars (except underscore/dash/space), then replace spaces with underscores
    const baseName = rawName
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .substring(0, 100); // Limit name length
    const safeName = baseName || "berkas";
    const timestamp = Date.now();
    const storagePath = `submissions/${nim}/${safeName}_${timestamp}${ext}`;
    console.log(`[Upload] Uploading to Supabase: ${storagePath} (${file.mimetype}, ${file.size} bytes)`);
    const { data, error } = await supabase_1.supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
    });
    if (error) {
        console.error(`[Upload] Supabase error:`, error);
        throw new Error(`Gagal upload berkas: ${error.message}`);
    }
    const { data: publicUrlData } = supabase_1.supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(data.path);
    return { storagePath: data.path, publicUrl: publicUrlData.publicUrl };
}
class PendaftaranUjianService {
    async getAll() {
        const list = await prisma_1.prisma.pendaftaranUjian.findMany({
            include: {
                mahasiswa: { include: { user: true, prodi: true } },
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: { include: { syarat: true } },
                ujian: { include: { ruangan: true, pengujiUjians: true } },
            },
        });
        return list.map((p) => this.transformPendaftaran(p));
    }
    async getById(id) {
        const p = await prisma_1.prisma.pendaftaranUjian.findUnique({
            where: { id: Number(id) },
            include: {
                mahasiswa: { include: { user: true, prodi: true } },
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: { include: { syarat: true } },
                ujian: { include: { ruangan: true, pengujiUjians: true } },
            },
        });
        return this.transformPendaftaran(p);
    }
    async store(payload, files) {
        // Get mahasiswa for eligibility check and folder path
        const mahasiswa = await prisma_1.prisma.mahasiswa.findUnique({
            where: { id: Number(payload.mahasiswa_id) },
        });
        if (!mahasiswa)
            throw new http_error_1.HttpError(404, "Data mahasiswa tidak ditemukan");
        // Eligibility check: IPK >= 2 and Semester >= 6
        if (Number(mahasiswa.ipk) < 2) {
            throw new http_error_1.HttpError(400, `Syarat IPK minimal 2.0. IPK Anda saat ini: ${mahasiswa.ipk}`);
        }
        if (mahasiswa.semester < 6) {
            throw new http_error_1.HttpError(400, `Syarat semester minimal semester 6. Semester Anda saat ini: ${mahasiswa.semester}`);
        }
        // Ranpel approval check
        const approvedRanpel = await prisma_1.prisma.pengajuanRancanganPenelitian.findFirst({
            where: {
                rancanganPenelitianId: Number(payload.ranpel_id),
                mahasiswaId: Number(payload.mahasiswa_id),
                statusKaprodi: "diterima",
            },
        });
        if (!approvedRanpel) {
            throw new http_error_1.HttpError(400, "Rancangan Penelitian (Ranpel) Anda belum disetujui oleh Kaprodi. Pastikan Ranpel sudah di-ACC sebelum mendaftar ujian.");
        }
        // Sequence check:
        // 2 (Ujian Hasil) needs 1 (Seminar Proposal) Lulus
        // 3 (Ujian Skripsi) needs 2 (Ujian Hasil) Lulus
        const targetJenisId = Number(payload.jenis_ujian_id);
        if (targetJenisId === 2) {
            const hasPassedSempro = await prisma_1.prisma.ujian.findFirst({
                where: {
                    pendaftaranUjian: {
                        mahasiswaId: Number(payload.mahasiswa_id),
                        jenisUjianId: 1,
                    },
                    hasil: "lulus",
                },
            });
            if (!hasPassedSempro) {
                throw new http_error_1.HttpError(400, "Anda harus lulus Seminar Proposal terlebih dahulu sebelum mendaftar Ujian Hasil");
            }
        }
        if (targetJenisId === 3) {
            const hasPassedHasil = await prisma_1.prisma.ujian.findFirst({
                where: {
                    pendaftaranUjian: {
                        mahasiswaId: Number(payload.mahasiswa_id),
                        jenisUjianId: 2,
                    },
                    hasil: "lulus",
                },
            });
            if (!hasPassedHasil) {
                throw new http_error_1.HttpError(400, "Anda harus lulus Ujian Hasil terlebih dahulu sebelum mendaftar Ujian Skripsi");
            }
        }
        const nim = mahasiswa.nim;
        // Upload files to Supabase FIRST (outside transaction to avoid timeout)
        const uploadedFiles = [];
        if (files && files.length > 0) {
            for (const f of files) {
                const { publicUrl } = await uploadToSupabase(f, nim);
                uploadedFiles.push({
                    nama_berkas: f.originalname,
                    file_path: publicUrl,
                });
            }
        }
        // Then do fast DB operations in a transaction
        return await prisma_1.prisma.$transaction(async (tx) => {
            const pendaftaran = await tx.pendaftaranUjian.create({
                data: {
                    mahasiswaId: Number(payload.mahasiswa_id),
                    rancanganPenelitianId: Number(payload.ranpel_id),
                    jenisUjianId: Number(payload.jenis_ujian_id),
                    tanggalPendaftaran: new Date(),
                    status: "menunggu",
                    keterangan: payload.keterangan || null,
                },
            });
            if (uploadedFiles.length > 0) {
                // Get all requirements for this exam type
                const allSyarat = await tx.syarat.findMany({
                    where: { jenisUjianId: Number(payload.jenis_ujian_id) },
                });
                for (const uf of uploadedFiles) {
                    // Find matching syarat by name (basename of file)
                    const matchingSyarat = allSyarat.find((s) => {
                        const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
                        const fileNameWithoutExt = lastDotIndex !== -1
                            ? uf.nama_berkas.substring(0, lastDotIndex)
                            : uf.nama_berkas;
                        return (s.namaSyarat.trim().toLowerCase() ===
                            fileNameWithoutExt.trim().toLowerCase());
                    });
                    if (matchingSyarat) {
                        await tx.pemenuhanSyarat.upsert({
                            where: {
                                pendaftaranUjianId_syaratId: {
                                    pendaftaranUjianId: pendaftaran.id,
                                    syaratId: matchingSyarat.id,
                                },
                            },
                            create: {
                                pendaftaranUjianId: pendaftaran.id,
                                syaratId: matchingSyarat.id,
                                fileBukti: uf.file_path,
                                terpenuhi: true,
                            },
                            update: {
                                fileBukti: uf.file_path,
                            },
                        });
                    }
                }
            }
            const result = await tx.pendaftaranUjian.findUnique({
                where: { id: pendaftaran.id },
                include: {
                    mahasiswa: { include: { user: true, prodi: true } },
                    jenisUjian: true,
                    rancanganPenelitian: true,
                    pemenuhanSyarats: { include: { syarat: true } },
                },
            });
            return this.transformPendaftaran(result);
        });
    }
    async update(id, payload, files) {
        const pendaftaran = await prisma_1.prisma.pendaftaranUjian.findUnique({
            where: { id: Number(id) },
            include: { mahasiswa: true },
        });
        if (!pendaftaran)
            throw new Error("Data pendaftaran tidak ada");
        const nim = pendaftaran.mahasiswa?.nim || pendaftaran.mahasiswaId.toString();
        // Upload files to Supabase FIRST (outside transaction)
        const uploadedFiles = [];
        if (files && files.length > 0) {
            for (const f of files) {
                const { publicUrl } = await uploadToSupabase(f, nim);
                uploadedFiles.push({
                    nama_berkas: f.originalname,
                    file_path: publicUrl,
                });
            }
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            const dataUpdate = { ...payload };
            if (payload.ranpel_id) {
                const approvedRanpel = await tx.pengajuanRancanganPenelitian.findFirst({
                    where: {
                        rancanganPenelitianId: Number(payload.ranpel_id),
                        mahasiswaId: pendaftaran.mahasiswaId,
                        statusKaprodi: "diterima",
                    },
                });
                if (!approvedRanpel) {
                    throw new http_error_1.HttpError(400, "Rancangan Penelitian (Ranpel) yang dipilih belum disetujui oleh Kaprodi.");
                }
                dataUpdate.rancanganPenelitianId = Number(payload.ranpel_id);
            }
            if (payload.jenis_ujian_id)
                dataUpdate.jenisUjianId = Number(payload.jenis_ujian_id);
            if (payload.status === "diterima" && !pendaftaran.tanggalDisetujui) {
                dataUpdate.tanggalDisetujui = new Date();
            }
            await tx.pendaftaranUjian.update({
                where: { id: Number(id) },
                data: dataUpdate,
            });
            if (uploadedFiles.length > 0) {
                // Get all requirements for this exam type
                const allSyarat = await tx.syarat.findMany({
                    where: {
                        jenisUjianId: Number(payload.jenis_ujian_id || pendaftaran.jenisUjianId),
                    },
                });
                for (const uf of uploadedFiles) {
                    // Find matching syarat by name
                    const matchingSyarat = allSyarat.find((s) => {
                        const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
                        const fileNameWithoutExt = lastDotIndex !== -1
                            ? uf.nama_berkas.substring(0, lastDotIndex)
                            : uf.nama_berkas;
                        return (s.namaSyarat.trim().toLowerCase() ===
                            fileNameWithoutExt.trim().toLowerCase());
                    });
                    if (matchingSyarat) {
                        await tx.pemenuhanSyarat.upsert({
                            where: {
                                pendaftaranUjianId_syaratId: {
                                    pendaftaranUjianId: Number(id),
                                    syaratId: matchingSyarat.id,
                                },
                            },
                            create: {
                                pendaftaranUjianId: Number(id),
                                syaratId: matchingSyarat.id,
                                fileBukti: uf.file_path,
                                terpenuhi: true,
                            },
                            update: {
                                fileBukti: uf.file_path,
                            },
                        });
                    }
                }
            }
            const result = await tx.pendaftaranUjian.findUnique({
                where: { id: Number(id) },
                include: {
                    mahasiswa: { include: { user: true, prodi: true } },
                    jenisUjian: true,
                    rancanganPenelitian: true,
                    pemenuhanSyarats: { include: { syarat: true } },
                },
            });
            return this.transformPendaftaran(result);
        });
    }
    async submit(id) {
        const pendaftaran = await prisma_1.prisma.pendaftaranUjian.findUnique({
            where: { id: Number(id) },
            include: {
                jenisUjian: {
                    include: { syarats: { where: { wajib: true } } },
                },
                pemenuhanSyarats: true,
            },
        });
        if (!pendaftaran)
            throw new http_error_1.HttpError(404, "Data pendaftaran tidak ditemukan");
        if (pendaftaran.status !== "revisi") {
            throw new http_error_1.HttpError(400, "Pendaftaran hanya bisa di-submit jika status revisi");
        }
        const missingSyarat = pendaftaran.jenisUjian.syarats.filter((s) => {
            const ps = pendaftaran.pemenuhanSyarats.find((p) => p.syaratId === s.id);
            return !ps || !ps.fileBukti;
        });
        if (missingSyarat.length > 0) {
            const names = missingSyarat.map((s) => s.namaSyarat).join(", ");
            throw new http_error_1.HttpError(400, `Syarat wajib belum lengkap: ${names}`);
        }
        const updated = await prisma_1.prisma.pendaftaranUjian.update({
            where: { id: Number(id) },
            data: { status: "menunggu" },
            include: {
                mahasiswa: { include: { user: true, prodi: true } },
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: { include: { syarat: true } },
            },
        });
        return this.transformPendaftaran(updated);
    }
    async review(id, status, keterangan) {
        const data = { status };
        if (keterangan)
            data.keterangan = keterangan;
        if (status === "diterima")
            data.tanggalDisetujui = new Date();
        const updated = await prisma_1.prisma.pendaftaranUjian.update({
            where: { id: Number(id) },
            data,
            include: {
                mahasiswa: { include: { user: true, prodi: true } },
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: { include: { syarat: true } },
            },
        });
        return this.transformPendaftaran(updated);
    }
    async uploadRevisi(id, files) {
        const pendaftaran = await prisma_1.prisma.pendaftaranUjian.findUnique({
            where: { id: Number(id) },
            include: { mahasiswa: true },
        });
        if (!pendaftaran)
            throw new Error("Data pendaftaran tidak ada");
        if (pendaftaran.status !== "revisi" && pendaftaran.status !== "menunggu") {
            throw new Error("Hanya bisa upload ulang jika status revisi atau menunggu");
        }
        const nim = pendaftaran.mahasiswa?.nim || pendaftaran.mahasiswaId.toString();
        // Upload files to Supabase FIRST
        const uploadedFiles = [];
        for (const f of files) {
            const { publicUrl } = await uploadToSupabase(f, nim);
            uploadedFiles.push({
                nama_berkas: f.originalname,
                file_path: publicUrl,
            });
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Get all requirements for this exam type
            const allSyarat = await tx.syarat.findMany({
                where: { jenisUjianId: pendaftaran.jenisUjianId },
            });
            for (const uf of uploadedFiles) {
                const matchingSyarat = allSyarat.find((s) => {
                    const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
                    const fileNameWithoutExt = lastDotIndex !== -1
                        ? uf.nama_berkas.substring(0, lastDotIndex)
                        : uf.nama_berkas;
                    return (s.namaSyarat.trim().toLowerCase() ===
                        fileNameWithoutExt.trim().toLowerCase());
                });
                if (matchingSyarat) {
                    await tx.pemenuhanSyarat.upsert({
                        where: {
                            pendaftaranUjianId_syaratId: {
                                pendaftaranUjianId: Number(id),
                                syaratId: matchingSyarat.id,
                            },
                        },
                        create: {
                            pendaftaranUjianId: Number(id),
                            syaratId: matchingSyarat.id,
                            fileBukti: uf.file_path,
                            terpenuhi: true,
                        },
                        update: {
                            fileBukti: uf.file_path,
                            terpenuhi: true,
                        },
                    });
                }
            }
            const updated = await tx.pendaftaranUjian.update({
                where: { id: Number(id) },
                data: {
                    status: "menunggu",
                    keterangan: null, // Reset keterangan after revision
                },
                include: {
                    mahasiswa: { include: { user: true, prodi: true } },
                    jenisUjian: true,
                    rancanganPenelitian: true,
                    pemenuhanSyarats: { include: { syarat: true } },
                },
            });
            return this.transformPendaftaran(updated);
        });
    }
    async delete(id) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Delete all related requirement fulfillment records first
            await tx.pemenuhanSyarat.deleteMany({
                where: { pendaftaranUjianId: Number(id) },
            });
            // 2. Finally delete the registration itself
            return await tx.pendaftaranUjian.delete({
                where: { id: Number(id) },
            });
        });
    }
    async getByMahasiswa(mahasiswaId) {
        const list = await prisma_1.prisma.pendaftaranUjian.findMany({
            where: { mahasiswaId: Number(mahasiswaId) },
            include: {
                mahasiswa: { include: { user: true, prodi: true } },
                rancanganPenelitian: true,
                jenisUjian: true,
                pemenuhanSyarats: { include: { syarat: true } },
            },
        });
        return list.map((p) => this.transformPendaftaran(p));
    }
    transformPendaftaran(p) {
        if (!p)
            return null;
        return {
            id: p.id,
            mahasiswaId: p.mahasiswaId,
            rancanganPenelitianId: p.rancanganPenelitianId,
            jenisUjianId: p.jenisUjianId,
            tanggalPendaftaran: p.tanggalPendaftaran,
            tanggalDisetujui: p.tanggalDisetujui,
            status: p.status,
            keterangan: p.keterangan,
            mahasiswa: p.mahasiswa
                ? {
                    ...p.mahasiswa,
                    noHp: p.mahasiswa.noHp,
                    urlTtd: p.mahasiswa.urlTtd,
                    prodiId: p.mahasiswa.prodiId,
                    peminatanId: p.mahasiswa.peminatanId,
                    dosenPa: p.mahasiswa.dosenPa,
                    pembimbing1: p.mahasiswa.pembimbing1,
                    pembimbing2: p.mahasiswa.pembimbing2,
                    nama: p.mahasiswa.user?.nama,
                    ipk: p.mahasiswa.ipk ? Number(p.mahasiswa.ipk) : 0,
                    user: p.mahasiswa.user,
                }
                : undefined,
            rancanganPenelitian: p.rancanganPenelitian
                ? {
                    ...p.rancanganPenelitian,
                    mahasiswaId: p.rancanganPenelitian.mahasiswaId,
                    judulPenelitian: p.rancanganPenelitian.judulPenelitian,
                    masalahDanPenyebab: p.rancanganPenelitian.masalahDanPenyebab,
                    alternatifSolusi: p.rancanganPenelitian.alternatifSolusi,
                    metodePenelitian: p.rancanganPenelitian.metodePenelitian,
                    hasilYangDiharapkan: p.rancanganPenelitian.hasilYangDiharapkan,
                    kebutuhanData: p.rancanganPenelitian.kebutuhanData,
                    jurnalReferensi: p.rancanganPenelitian.jurnalReferensi,
                }
                : undefined,
            jenisUjian: p.jenisUjian
                ? {
                    id: p.jenisUjian.id,
                    namaJenis: p.jenisUjian.namaJenis,
                    deskripsi: p.jenisUjian.deskripsi,
                }
                : undefined,
            berkas: p.pemenuhanSyarats
                ? p.pemenuhanSyarats.map((ps) => ({
                    id: ps.id,
                    namaBerkas: ps.syarat?.namaSyarat || "Berkas",
                    filePath: ps.fileBukti,
                }))
                : [],
            pemenuhanSyarats: p.pemenuhanSyarats
                ? p.pemenuhanSyarats.map((ps) => ({
                    id: ps.id,
                    pendaftaranUjianId: ps.pendaftaranUjianId,
                    syaratId: ps.syaratId,
                    fileBukti: ps.fileBukti,
                    terpenuhi: ps.terpenuhi,
                    keterangan: ps.keterangan,
                    syarat: ps.syarat
                        ? {
                            id: ps.syarat.id,
                            jenisUjianId: ps.syarat.jenisUjianId,
                            namaSyarat: ps.syarat.namaSyarat,
                            wajib: ps.syarat.wajib,
                        }
                        : undefined,
                }))
                : [],
            ujian: p.ujian,
        };
    }
}
exports.PendaftaranUjianService = PendaftaranUjianService;
exports.pendaftaranUjianService = new PendaftaranUjianService();
