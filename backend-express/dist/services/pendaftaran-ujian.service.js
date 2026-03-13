"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendaftaranUjianService = exports.PendaftaranUjianService = void 0;
const prisma_1 = require("../utils/prisma");
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
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${data.path}`;
    return { storagePath: data.path, publicUrl };
}
class PendaftaranUjianService {
    async getAll() {
        return await prisma_1.prisma.pendaftaranUjian.findMany({
            include: {
                mahasiswa: true,
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: true,
            },
        });
    }
    async getById(id) {
        return await prisma_1.prisma.pendaftaranUjian.findUnique({
            where: { id: Number(id) },
            include: {
                mahasiswa: true,
                jenisUjian: true,
                rancanganPenelitian: true,
                pemenuhanSyarats: true,
            },
        });
    }
    async store(payload, files) {
        // Get mahasiswa NIM for folder path
        const mahasiswa = await prisma_1.prisma.mahasiswa.findUnique({
            where: { id: Number(payload.mahasiswa_id) },
        });
        const nim = mahasiswa?.nim || payload.mahasiswa_id.toString();
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
                // TODO: refactor to use PemenuhanSyaratService
            }
            return await tx.pendaftaranUjian.findUnique({
                where: { id: pendaftaran.id },
                include: {
                    mahasiswa: true,
                    jenisUjian: true,
                    rancanganPenelitian: true,
                    pemenuhanSyarats: true,
                },
            });
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
            if (payload.ranpel_id)
                dataUpdate.rancanganPenelitianId = Number(payload.ranpel_id);
            if (payload.jenis_ujian_id)
                dataUpdate.jenisUjianId = Number(payload.jenis_ujian_id);
            // Auto approve check
            if (payload.status === "belum_dijadwalkan" &&
                !pendaftaran.tanggalDisetujui &&
                !payload.hasOwnProperty("tanggalDisetujui")) {
                dataUpdate.tanggalDisetujui = new Date();
            }
            await tx.pendaftaranUjian.update({
                where: { id: Number(id) },
                data: dataUpdate,
            });
            if (uploadedFiles.length > 0) {
                // TODO: refactor to use PemenuhanSyaratService
            }
            return await tx.pendaftaranUjian.findUnique({
                where: { id: Number(id) },
                include: {
                    mahasiswa: true,
                    jenisUjian: true,
                    rancanganPenelitian: true,
                    pemenuhanSyarats: true,
                },
            });
        });
    }
    async delete(id) {
        return await prisma_1.prisma.pendaftaranUjian.delete({
            where: { id: Number(id) },
        });
    }
    async getByMahasiswa(mahasiswaId) {
        return await prisma_1.prisma.pendaftaranUjian.findMany({
            where: { mahasiswaId: Number(mahasiswaId) },
            include: {
                mahasiswa: true,
                rancanganPenelitian: true,
                jenisUjian: true,
                pemenuhanSyarats: true,
            },
        });
    }
}
exports.PendaftaranUjianService = PendaftaranUjianService;
exports.pendaftaranUjianService = new PendaftaranUjianService();
