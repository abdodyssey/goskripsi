import { prisma } from "@/lib/prisma";
import { HttpError } from "../../utils/http-error";
import {
  CreatePendaftaranUjianInput,
  UpdatePendaftaranUjianInput,
} from "../schemas/pendaftaran-ujian.schema";
import { supabaseAdmin } from "@/lib/supabase";
import path from "path";
import { createPaginationMeta } from "@/utils/pagination";

const PENDAFTARAN_SELECT = {
  id: true,
  mahasiswaId: true,
  jenisUjianId: true,
  rancanganPenelitianId: true,
  tanggalPendaftaran: true,
  tanggalDisetujui: true,
  status: true,
  keterangan: true,
  mahasiswa: {
    select: {
      id: true,
      nim: true,
      noHp: true,
      urlTtd: true,
      prodiId: true,
      peminatanId: true,
      dosenPa: true,
      pembimbing1: true,
      pembimbing2: true,
      ipk: true,
      user: { select: { id: true, nama: true, email: true } },
      prodi: { select: { id: true, namaProdi: true } },
    },
  },
  jenisUjian: { select: { id: true, namaJenis: true, deskripsi: true } },
  rancanganPenelitian: {
    select: {
      id: true,
      mahasiswaId: true,
      judulPenelitian: true,
    },
  },
  pemenuhanSyarats: {
    select: {
      id: true,
      pendaftaranUjianId: true,
      syaratId: true,
      fileBukti: true,
      terpenuhi: true,
      keterangan: true,
      syarat: { select: { id: true, namaSyarat: true, wajib: true } },
    },
  },
  ujian: {
    select: {
      id: true,
      status: true, // Added for frontend filtering (belum_dijadwalkan, dijadwalkan, selesai)
      jadwalUjian: true,
      waktuMulai: true,
      waktuSelesai: true,
      ruanganId: true,
      ruangan: { select: { id: true, namaRuangan: true } },
      pengujiUjians: {
        select: {
          id: true,
          dosenId: true,
          peran: true,
          dosen: { select: { id: true, user: { select: { nama: true } } } },
        },
      },
    },
  },
};

const BUCKET = "skripsi_docs";

interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

async function uploadToSupabase(
  file: UploadFile,
  nim: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  const rawExt = path.extname(file.originalname) || ".pdf";
  const ext =
    rawExt
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase()
      .substring(0, 10) || ".pdf";
  const rawName = path.basename(file.originalname, rawExt);
  const baseName = rawName
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 100);
  const safeName = baseName || "berkas";
  const timestamp = Date.now();
  const storagePath = `submissions/${nim}/${safeName}_${timestamp}${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Gagal upload berkas: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return { storagePath: data.path, publicUrl: publicUrlData.publicUrl };
}

export class PendaftaranUjianService {
  async getAll(
    params: {
      skip?: number;
      take?: number;
      prodiId?: number | null;
      roles?: string[];
    } = {},
  ) {
    const { skip = 0, take = 10, prodiId, roles = [] } = params;

    const where: any = {};

    // If user is not superadmin and has a prodiId, filter by mahasiswa's prodi
    if (!roles.includes("superadmin") && prodiId) {
      where.mahasiswa = { prodiId };
    }

    const [list, total] = await Promise.all([
      prisma.pendaftaranUjian.findMany({
        where,
        skip,
        take,
        select: PENDAFTARAN_SELECT,
        orderBy: { id: "desc" },
      }),
      prisma.pendaftaranUjian.count({ where }),
    ]);

    return {
      data: list.map((p) => this.transformPendaftaran(p)),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async getById(id: string) {
    if (!id || isNaN(Number(id))) throw new Error("ID Pendaftaran tidak valid");

    const p = await prisma.pendaftaranUjian.findUnique({
      where: { id: Number(id) },
      select: PENDAFTARAN_SELECT,
    });
    return this.transformPendaftaran(p);
  }

  async store(payload: CreatePendaftaranUjianInput, files: UploadFile[]) {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id: Number(payload.mahasiswa_id) },
    });

    if (!mahasiswa) throw new HttpError(404, "Data mahasiswa tidak ditemukan");

    if (Number(mahasiswa.ipk) < 2) {
      throw new HttpError(
        400,
        `Syarat IPK minimal 2.0. IPK Anda saat ini: ${mahasiswa.ipk}`,
      );
    }

    if (mahasiswa.semester < 6) {
      throw new HttpError(
        400,
        `Syarat semester minimal semester 6. Semester Anda saat ini: ${mahasiswa.semester}`,
      );
    }

    const approvedRanpel = await prisma.pengajuanRancanganPenelitian.findFirst({
      where: {
        rancanganPenelitianId: Number(payload.ranpel_id),
        mahasiswaId: Number(payload.mahasiswa_id),
        statusKaprodi: "diterima",
      },
    });

    if (!approvedRanpel) {
      throw new HttpError(400, "Ranpel belum disetujui Kaprodi.");
    }

    const targetJenisId = Number(payload.jenis_ujian_id);
    if (targetJenisId === 2) {
      const hasPassedSempro = await prisma.ujian.findFirst({
        where: {
          pendaftaranUjian: {
            mahasiswaId: Number(payload.mahasiswa_id),
            jenisUjianId: 1,
          },
          hasil: "lulus",
        },
      });
      if (!hasPassedSempro)
        throw new HttpError(400, "Harus lulus Seminar Proposal dahulu.");
    }

    if (targetJenisId === 3) {
      const hasPassedHasil = await prisma.ujian.findFirst({
        where: {
          pendaftaranUjian: {
            mahasiswaId: Number(payload.mahasiswa_id),
            jenisUjianId: 2,
          },
          hasil: "lulus",
        },
      });
      if (!hasPassedHasil)
        throw new HttpError(400, "Harus lulus Ujian Hasil dahulu.");
    }

    const nim = mahasiswa.nim;
    const uploadedFiles: { nama_berkas: string; file_path: string }[] = [];
    if (files && files.length > 0) {
      for (const f of files) {
        const { publicUrl } = await uploadToSupabase(f, nim);
        uploadedFiles.push({
          nama_berkas: f.originalname,
          file_path: publicUrl,
        });
      }
    }

    return await prisma.$transaction(async (tx) => {
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
        const allSyarat = await tx.syarat.findMany({
          where: { jenisUjianId: Number(payload.jenis_ujian_id) },
        });
        for (const uf of uploadedFiles) {
          const matchingSyarat = allSyarat.find((s) => {
            const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
            const nameOnly =
              lastDotIndex !== -1
                ? uf.nama_berkas.substring(0, lastDotIndex)
                : uf.nama_berkas;
            return (
              s.namaSyarat.trim().toLowerCase() ===
              nameOnly.trim().toLowerCase()
            );
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
              update: { fileBukti: uf.file_path },
            });
          }
        }
      }

      return await tx.pendaftaranUjian.findUnique({
        where: { id: pendaftaran.id },
        select: PENDAFTARAN_SELECT,
      });
    });
  }

  async update(
    id: string,
    payload: UpdatePendaftaranUjianInput,
    files: UploadFile[],
  ) {
    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id: Number(id) },
      include: { mahasiswa: true },
    });
    if (!pendaftaran) throw new Error("Data pendaftaran tidak ada");

    const nim = pendaftaran.mahasiswa.nim;
    const uploadedFiles: { nama_berkas: string; file_path: string }[] = [];
    if (files && files.length > 0) {
      for (const f of files) {
        const { publicUrl } = await uploadToSupabase(f, nim);
        uploadedFiles.push({
          nama_berkas: f.originalname,
          file_path: publicUrl,
        });
      }
    }

    return await prisma.$transaction(async (tx) => {
      const dataUpdate: any = { ...payload };
      if (payload.ranpel_id) {
        const approvedRanpel = await tx.pengajuanRancanganPenelitian.findFirst({
          where: {
            rancanganPenelitianId: Number(payload.ranpel_id),
            mahasiswaId: pendaftaran.mahasiswaId,
            statusKaprodi: "diterima",
          },
        });
        if (!approvedRanpel)
          throw new HttpError(400, "Ranpel belum disetujui.");
        dataUpdate.rancanganPenelitianId = Number(payload.ranpel_id);
      }
      if (payload.jenis_ujian_id)
        dataUpdate.jenisUjianId = Number(payload.jenis_ujian_id);
      if (payload.status === "diterima" && !pendaftaran.tanggalDisetujui)
        dataUpdate.tanggalDisetujui = new Date();

      await tx.pendaftaranUjian.update({
        where: { id: Number(id) },
        data: dataUpdate,
      });

      if (uploadedFiles.length > 0) {
        const allSyarat = await tx.syarat.findMany({
          where: {
            jenisUjianId: Number(
              payload.jenis_ujian_id || pendaftaran.jenisUjianId,
            ),
          },
        });
        for (const uf of uploadedFiles) {
          const matchingSyarat = allSyarat.find((s) => {
            const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
            const nameOnly =
              lastDotIndex !== -1
                ? uf.nama_berkas.substring(0, lastDotIndex)
                : uf.nama_berkas;
            return (
              s.namaSyarat.trim().toLowerCase() ===
              nameOnly.trim().toLowerCase()
            );
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
              update: { fileBukti: uf.file_path },
            });
          }
        }
      }

      return await tx.pendaftaranUjian.findUnique({
        where: { id: Number(id) },
        select: PENDAFTARAN_SELECT,
      });
    });
  }

  async submit(id: string) {
    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id: Number(id) },
      include: {
        jenisUjian: { include: { syarats: { where: { wajib: true } } } },
        pemenuhanSyarats: true,
      },
    });
    if (!pendaftaran)
      throw new HttpError(404, "Data pendaftaran tidak ditemukan");
    if (pendaftaran.status !== "revisi")
      throw new HttpError(400, "Status harus revisi.");

    const missingSyarat = pendaftaran.jenisUjian.syarats.filter((s) => {
      const ps = pendaftaran.pemenuhanSyarats.find((p) => p.syaratId === s.id);
      return !ps || !ps.fileBukti;
    });

    if (missingSyarat.length > 0)
      throw new HttpError(400, "Syarat wajib belum lengkap.");

    const updated = await prisma.pendaftaranUjian.update({
      where: { id: Number(id) },
      data: { status: "menunggu" },
      select: PENDAFTARAN_SELECT,
    });
    return this.transformPendaftaran(updated);
  }

  async review(
    id: string,
    status: "revisi" | "diterima" | "ditolak",
    keterangan?: string,
  ) {
    const data: any = { status };
    if (keterangan) data.keterangan = keterangan;
    if (status === "diterima") data.tanggalDisetujui = new Date();

    const updated = await prisma.pendaftaranUjian.update({
      where: { id: Number(id) },
      data,
      select: PENDAFTARAN_SELECT,
    });
    return this.transformPendaftaran(updated);
  }

  async uploadRevisi(id: string, files: UploadFile[]) {
    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id: Number(id) },
      include: { mahasiswa: true },
    });
    if (!pendaftaran) throw new Error("Data pendaftaran tidak ada");

    const nim = pendaftaran.mahasiswa.nim;
    const uploadedFiles: { nama_berkas: string; file_path: string }[] = [];
    for (const f of files) {
      const { publicUrl } = await uploadToSupabase(f, nim);
      uploadedFiles.push({ nama_berkas: f.originalname, file_path: publicUrl });
    }

    return await prisma.$transaction(async (tx) => {
      const allSyarat = await tx.syarat.findMany({
        where: { jenisUjianId: pendaftaran.jenisUjianId },
      });
      for (const uf of uploadedFiles) {
        const matchingSyarat = allSyarat.find((s) => {
          const lastDotIndex = uf.nama_berkas.lastIndexOf(".");
          const nameOnly =
            lastDotIndex !== -1
              ? uf.nama_berkas.substring(0, lastDotIndex)
              : uf.nama_berkas;
          return (
            s.namaSyarat.trim().toLowerCase() === nameOnly.trim().toLowerCase()
          );
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
            update: { fileBukti: uf.file_path, terpenuhi: true },
          });
        }
      }
      return await tx.pendaftaranUjian.update({
        where: { id: Number(id) },
        data: { status: "menunggu", keterangan: null },
        select: PENDAFTARAN_SELECT,
      });
    });
  }

  async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.pemenuhanSyarat.deleteMany({
        where: { pendaftaranUjianId: Number(id) },
      });
      return await tx.pendaftaranUjian.delete({ where: { id: Number(id) } });
    });
  }

  async getByMahasiswa(params: {
    mahasiswaId: string;
    skip?: number;
    take?: number;
  }) {
    const { mahasiswaId, skip = 0, take = 10 } = params;
    if (!mahasiswaId || isNaN(Number(mahasiswaId)))
      return { data: [], meta: createPaginationMeta(0, 1, take) };

    const where = { mahasiswaId: Number(mahasiswaId) };
    const [list, total] = await Promise.all([
      prisma.pendaftaranUjian.findMany({
        where,
        skip,
        take,
        select: PENDAFTARAN_SELECT,
        orderBy: { id: "desc" },
      }),
      prisma.pendaftaranUjian.count({ where }),
    ]);

    return {
      data: list.map((p) => this.transformPendaftaran(p)),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  private transformPendaftaran(p: any) {
    if (!p) return null;
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
            nama: p.mahasiswa.user?.nama,
            ipk: p.mahasiswa.ipk ? Number(p.mahasiswa.ipk) : 0,
          }
        : undefined,
      rancanganPenelitian: p.rancanganPenelitian,
      jenisUjian: p.jenisUjian,
      pemenuhanSyarats: (p.pemenuhanSyarats || []).map((ps: any) => ({
        id: ps.id,
        syaratId: ps.syaratId,
        fileBukti: ps.fileBukti,
        terpenuhi: ps.terpenuhi,
        keterangan: ps.keterangan,
        syarat: ps.syarat,
      })),
      berkas: (p.pemenuhanSyarats || [])
        .filter((ps: any) => ps.fileBukti)
        .map((ps: any) => ({
          id: ps.id.toString(),
          namaBerkas: ps.syarat?.namaSyarat || "Berkas",
          filePath: ps.fileBukti,
        })),
      ujian: p.ujian,
    };
  }
}

export const pendaftaranUjianService = new PendaftaranUjianService();
