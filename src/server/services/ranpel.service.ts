import { prisma } from "@/lib/prisma";
import {
  CreateRanpelInput,
  UpdateRanpelInput,
  UpdatePengajuanRanpelInput,
} from "../schemas/ranpel.schema";
import { mailService } from "./mail.service";
import { createPaginationMeta } from "@/utils/pagination";

const RANPEL_SELECT = {
  id: true,
  mahasiswaId: true,
  judulPenelitian: true,
  masalahDanPenyebab: true,
  alternatifSolusi: true,
  metodePenelitian: true,
  hasilYangDiharapkan: true,
  kebutuhanData: true,
  jurnalReferensi: true,
};

const PENGAJUAN_RANPEL_SELECT = {
  id: true,
  rancanganPenelitianId: true,
  mahasiswaId: true,
  tanggalPengajuan: true,
  statusDosenPa: true,
  statusKaprodi: true,
  catatanDosenPa: true,
  tanggalReviewPa: true,
  catatanKaprodi: true,
  tanggalReviewKaprodi: true,
  komenPaMasalah: true,
  komenPaSolusi: true,
  komenPaHasil: true,
  komenPaData: true,
  komenPaMetode: true,
  komenKprMasalah: true,
  komenKprSolusi: true,
  komenKprHasil: true,
  komenKprData: true,
  komenKprMetode: true,
  rancanganPenelitian: { select: RANPEL_SELECT },
  mahasiswa: {
    select: {
      id: true,
      nim: true,
      user: { select: { id: true, nama: true, email: true } },
      prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
      peminatan: { select: { id: true, namaPeminatan: true, prodiId: true } },
      dosenPaRel: {
        select: {
          id: true,
          nip: true,
          nidn: true,
          user: { select: { nama: true } },
        },
      },
      pembimbing1Rel: {
        select: {
          id: true,
          nip: true,
          nidn: true,
          user: { select: { nama: true } },
        },
      },
      pembimbing2Rel: {
        select: {
          id: true,
          nip: true,
          nidn: true,
          user: { select: { nama: true } },
        },
      },
    },
  },
};

export class RanpelService {
  async getAllRanpel() {
    const list = await prisma.rancanganPenelitian.findMany({});
    return list.map((r) => this.transformRanpel(r));
  }

  async getAllPengajuan(params: {
    userId?: string;
    roles?: string[];
    skip?: number;
    take?: number;
    prodiId?: number | null;
  }) {
    const { userId, roles = [], skip = 0, take = 10, prodiId } = params;
    const where: any = {};

    const isManagement = roles.some((r) =>
      ["admin", "superadmin", "kaprodi", "sekprodi"].includes(r),
    );

    if (userId && roles.includes("dosen") && !isManagement) {
      if (isNaN(Number(userId)))
        return { data: [], meta: createPaginationMeta(0, 1, take) };
      where.mahasiswa = {
        dosenPa: Number(userId),
      };
    }

    // If user is admin/kaprodi/sekprodi (but not superadmin) with a prodiId, filter by mahasiswa prodi
    if (isManagement && !roles.includes("superadmin") && prodiId) {
      where.mahasiswa = {
        prodiId,
      };
    }

    try {
      const [list, total] = await Promise.all([
        prisma.pengajuanRancanganPenelitian.findMany({
          where,
          skip,
          take,
          select: PENGAJUAN_RANPEL_SELECT,
          orderBy: { tanggalPengajuan: "desc" },
        }),
        prisma.pengajuanRancanganPenelitian.count({ where }),
      ]);

      return {
        data: list.map((p) => this.transformPengajuan(p)),
        meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
      };
    } catch (error: any) {
      console.error("[RanpelService] getAllPengajuan error:", error.message);
      if (error.message.includes("relationLoadStrategy") || error.message.includes("Query engine")) {
        return await this.getAllPengajuanWithoutStrategy(params);
      }
      throw error;
    }
  }

  private async getAllPengajuanWithoutStrategy(params: {
    userId?: string;
    roles?: string[];
    skip?: number;
    take?: number;
    prodiId?: number | null;
  }) {
    const { userId, roles = [], skip = 0, take = 10, prodiId } = params;
    const where: any = {};

    const isManagement = roles.some((r) =>
      ["admin", "superadmin", "kaprodi", "sekprodi"].includes(r),
    );

    if (userId && roles.includes("dosen") && !isManagement) {
      if (!isNaN(Number(userId))) {
        where.mahasiswa = { dosenPa: Number(userId) };
      }
    }

    if (isManagement && !roles.includes("superadmin") && prodiId) {
      where.mahasiswa = { prodiId };
    }

    const [list, total] = await Promise.all([
      prisma.pengajuanRancanganPenelitian.findMany({
        where,
        skip,
        take,
        select: PENGAJUAN_RANPEL_SELECT,
        orderBy: { tanggalPengajuan: "desc" },
      }),
      prisma.pengajuanRancanganPenelitian.count({ where }),
    ]);

    return {
      data: list.map((p) => this.transformPengajuan(p)),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async storeRanpel(payload: CreateRanpelInput) {
    const result = await prisma.rancanganPenelitian.create({
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
    return this.transformRanpel(result);
  }

  async storeByMahasiswa(payload: CreateRanpelInput, mahasiswaId: string) {
    console.log(
      `[RanpelService] storeByMahasiswa called with MhsID: ${mahasiswaId}`,
      payload,
    );
    if (!mahasiswaId || isNaN(Number(mahasiswaId)))
      throw new Error("Mahasiswa ID tidak valid");

    const result = await prisma.$transaction(async (tx) => {
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

      return { rancanganPenelitian };
    });

    // Send Notification
    try {
      const mhs = await prisma.mahasiswa.findUnique({
        where: { id: Number(mahasiswaId) },
        include: {
          user: true,
          dosenPaRel: { include: { user: true } },
        },
      });

      if (mhs?.dosenPaRel?.user?.email) {
        console.log(
          `[RanpelService] Triggering submission email to PA: ${mhs.dosenPaRel.user.email}`,
        );
        await mailService.sendRanpelSubmissionNotification(
          mhs.dosenPaRel.user.email,
          mhs.dosenPaRel.user.nama,
          mhs.user.nama,
          payload.judul_penelitian,
        );
      } else {
        console.warn(
          `[RanpelService] Could not send email. PA not found or has no email for Mhs ID: ${mahasiswaId}`,
        );
      }
    } catch (err) {
      console.error(
        "[RanpelService] Error in submission notification flow:",
        err,
      );
    }

    return this.transformRanpel(result.rancanganPenelitian);
  }

  async updateRanpelByMahasiswa(
    rancanganPenelitianId: string,
    payload: UpdateRanpelInput,
  ) {
    if (isNaN(Number(rancanganPenelitianId)))
      throw new Error("ID Ranpel tidak valid");

    const dataUpdate: any = {};
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

    const result = await prisma.rancanganPenelitian.update({
      where: { id: Number(rancanganPenelitianId) },
      data: dataUpdate,
    });
    return this.transformRanpel(result);
  }

  async updatePengajuan(
    pengajuanId: string,
    payload: UpdatePengajuanRanpelInput,
  ) {
    if (isNaN(Number(pengajuanId))) throw new Error("ID Pengajuan tidak valid");

    const dataUpdate: any = {};

    if (payload.status_dosen_pa) {
      dataUpdate.statusDosenPa = payload.status_dosen_pa;
      if (payload.status_dosen_pa !== "menunggu") {
        dataUpdate.tanggalReviewPa = new Date();
      } else {
        dataUpdate.tanggalReviewPa = null;
      }
    }

    if (payload.status_kaprodi) {
      dataUpdate.statusKaprodi = payload.status_kaprodi;
      if (payload.status_kaprodi !== "menunggu") {
        dataUpdate.tanggalReviewKaprodi = new Date();
      } else {
        dataUpdate.tanggalReviewKaprodi = null;
      }
    }

    // Legacy support for 'status' field if needed, mapping to Kaprodi if it's accepted/rejected
    if (payload.status && !payload.status_dosen_pa && !payload.status_kaprodi) {
      if (payload.status === "diverifikasi") {
        dataUpdate.statusDosenPa = payload.status;
        dataUpdate.tanggalReviewPa = new Date();
      } else {
        dataUpdate.statusKaprodi = payload.status;
        dataUpdate.tanggalReviewKaprodi = new Date();
      }
    }

    if (payload.catatan_dosen_pa !== undefined) {
      dataUpdate.catatanDosenPa = payload.catatan_dosen_pa;
    }
    if (payload.catatan_kaprodi !== undefined) {
      dataUpdate.catatanKaprodi = payload.catatan_kaprodi;
    }

    // Section comments PA
    if (payload.komen_pa_masalah !== undefined)
      dataUpdate.komenPaMasalah = payload.komen_pa_masalah;
    if (payload.komen_pa_solusi !== undefined)
      dataUpdate.komenPaSolusi = payload.komen_pa_solusi;
    if (payload.komen_pa_hasil !== undefined)
      dataUpdate.komenPaHasil = payload.komen_pa_hasil;
    if (payload.komen_pa_data !== undefined)
      dataUpdate.komenPaData = payload.komen_pa_data;
    if (payload.komen_pa_metode !== undefined)
      dataUpdate.komenPaMetode = payload.komen_pa_metode;

    // Section comments Kaprodi
    if (payload.komen_kpr_masalah !== undefined)
      dataUpdate.komenKprMasalah = payload.komen_kpr_masalah;
    if (payload.komen_kpr_solusi !== undefined)
      dataUpdate.komenKprSolusi = payload.komen_kpr_solusi;
    if (payload.komen_kpr_hasil !== undefined)
      dataUpdate.komenKprHasil = payload.komen_kpr_hasil;
    if (payload.komen_kpr_data !== undefined)
      dataUpdate.komenKprData = payload.komen_kpr_data;
    if (payload.komen_kpr_metode !== undefined)
      dataUpdate.komenKprMetode = payload.komen_kpr_metode;

    const result = await prisma.pengajuanRancanganPenelitian.update({
      where: { id: Number(pengajuanId) },
      data: dataUpdate,
      select: PENGAJUAN_RANPEL_SELECT,
    });

    // Send Notification
    if (result.mahasiswa?.user?.email) {
      const mhsEmail = result.mahasiswa.user.email;
      const mhsNama = result.mahasiswa.user.nama;
      const judul = result.rancanganPenelitian?.judulPenelitian || "-";

      const statusToNotify =
        payload.status_dosen_pa || payload.status_kaprodi || payload.status;

      if (statusToNotify && statusToNotify !== "menunggu") {
        // If Approved by PA (Verified), notify Kaprodi
        if (
          statusToNotify === "diverifikasi" ||
          payload.status_dosen_pa === "diverifikasi"
        ) {
          const paNama = result.mahasiswa.dosenPaRel?.user?.nama || "Dosen PA";
          mailService.sendRanpelReviewNotification(
            mhsEmail,
            mhsNama,
            paNama,
            "diverifikasi",
            payload.catatan_dosen_pa || "",
            judul,
          );

          const kaprodi = await prisma.user.findFirst({
            where: { role: { name: "kaprodi" } },
          });
          if (kaprodi?.email) {
            mailService.sendRanpelApprovalToKaprodiNotification(
              kaprodi.email,
              mhsNama,
              judul,
            );
          }
        } else if (
          statusToNotify === "diterima" ||
          statusToNotify === "ditolak"
        ) {
          // Notify Student about Kaprodi review
          mailService.sendRanpelReviewNotification(
            mhsEmail,
            mhsNama,
            "Ketua Program Studi",
            statusToNotify,
            payload.catatan_kaprodi || "",
            judul,
          );
        }
      }
    }

    return this.transformPengajuan(result);
  }

  async getPengajuanByMahasiswa(params: {
    mahasiswaId: string;
    skip?: number;
    take?: number;
  }) {
    const { mahasiswaId, skip = 0, take = 10 } = params;
    if (!mahasiswaId || isNaN(Number(mahasiswaId)))
      return { data: [], meta: createPaginationMeta(0, 1, take) };

    const mId = Number(mahasiswaId);

    try {
      // Optimization: Fetch student data once since it's the same for all rows
      // This reduces join complexity which often causes issues in production
      const [m, [list, total]] = await Promise.all([
        prisma.mahasiswa.findUnique({
          where: { id: mId },
          select: PENGAJUAN_RANPEL_SELECT.mahasiswa.select
        }),
        Promise.all([
          prisma.pengajuanRancanganPenelitian.findMany({
            where: { mahasiswaId: mId },
            skip,
            take,
            select: {
              ...PENGAJUAN_RANPEL_SELECT,
              mahasiswa: false // Don't join here, we have it already
            },
            orderBy: { id: "desc" },
          }),
          prisma.pengajuanRancanganPenelitian.count({ where: { mahasiswaId: mId } }),
        ])
      ]);

      if (!m) {
        console.warn(`[RanpelService] Mahasiswa with ID ${mId} not found`);
        return { data: [], meta: createPaginationMeta(0, 1, take) };
      }

      // Merge student data back into each pengajuan object
      const transformedData = list.map((p) => {
        const fullPengajuan = { ...p, mahasiswa: m };
        return this.transformPengajuan(fullPengajuan);
      });

      return {
        data: transformedData,
        meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
      };
    } catch (error: any) {
      console.error("[RanpelService] getPengajuanByMahasiswa error:", {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      
      // Fallback for any Prisma error that might be environment-specific
      console.log("[RanpelService] Attempting simple fallback...");
      return await this.getPengajuanByMahasiswaSimple(params);
    }
  }

  /**
   * Extremely simple fallback that avoids most joins to ensure data visibility
   */
  private async getPengajuanByMahasiswaSimple(params: {
    mahasiswaId: string;
    skip?: number;
    take?: number;
  }) {
    const { mahasiswaId, skip = 0, take = 10 } = params;
    const mId = Number(mahasiswaId);

    try {
      const [list, total] = await Promise.all([
        prisma.pengajuanRancanganPenelitian.findMany({
          where: { mahasiswaId: mId },
          skip,
          take,
          include: {
            rancanganPenelitian: true,
          },
          orderBy: { id: "desc" },
        }),
        prisma.pengajuanRancanganPenelitian.count({ where: { mahasiswaId: mId } }),
      ]);

      return {
        data: list.map(p => this.transformPengajuan(p)),
        meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
      };
    } catch (err: any) {
      console.error("[RanpelService] Simple fallback also failed:", err.message);
      throw err;
    }
  }

  async getPengajuanById(id: string) {
    if (!id || isNaN(Number(id))) return null;

    const p = await prisma.pengajuanRancanganPenelitian.findUnique({
      where: { id: Number(id) },
      select: PENGAJUAN_RANPEL_SELECT,
    });
    return this.transformPengajuan(p);
  }

  async deleteRanpel(id: string) {
    if (isNaN(Number(id))) return null;
    return await prisma.rancanganPenelitian.delete({
      where: { id: Number(id) },
    });
  }

  async deletePengajuan(id: string) {
    if (isNaN(Number(id))) return null;
    return await prisma.pengajuanRancanganPenelitian.delete({
      where: { id: Number(id) },
    });
  }

  private transformRanpel(r: any) {
    if (!r) return null;
    return {
      id: r.id,
      mahasiswaId: r.mahasiswaId,
      judulPenelitian: r.judulPenelitian,
      masalahDanPenyebab: r.masalahDanPenyebab,
      alternatifSolusi: r.alternatifSolusi,
      metodePenelitian: r.metodePenelitian,
      hasilYangDiharapkan: r.hasilYangDiharapkan,
      kebutuhanData: r.kebutuhanData,
      jurnalReferensi: r.jurnalReferensi,
      mahasiswa: r.mahasiswa ? this.transformMahasiswa(r.mahasiswa) : undefined,
    };
  }

  private transformPengajuan(p: any) {
    if (!p) return null;
    return {
      id: p.id,
      rancanganPenelitianId: p.rancanganPenelitianId,
      mahasiswaId: p.mahasiswaId,
      tanggalPengajuan: p.tanggalPengajuan,
      statusDosenPa: p.statusDosenPa,
      statusKaprodi: p.statusKaprodi,
      catatanDosenPa: p.catatanDosenPa,
      tanggalReviewPa: p.tanggalReviewPa,
      catatanKaprodi: p.catatanKaprodi,
      tanggalReviewKaprodi: p.tanggalReviewKaprodi,
      komenPaMasalah: p.komenPaMasalah,
      komenPaSolusi: p.komenPaSolusi,
      komenPaHasil: p.komenPaHasil,
      komenPaData: p.komenPaData,
      komenPaMetode: p.komenPaMetode,
      komenKprMasalah: p.komenKprMasalah,
      komenKprSolusi: p.komenKprSolusi,
      komenKprHasil: p.komenKprHasil,
      komenKprData: p.komenKprData,
      komenKprMetode: p.komenKprMetode,
      rancanganPenelitian: p.rancanganPenelitian
        ? this.transformRanpel(p.rancanganPenelitian)
        : undefined,
      mahasiswa: p.mahasiswa ? this.transformMahasiswa(p.mahasiswa) : undefined,
    };
  }

  private transformMahasiswa(m: any) {
    if (!m) return null;
    return {
      ...m,
      noHp: m.noHp,
      urlTtd: m.urlTtd,
      prodiId: m.prodiId,
      prodi: this.transformProdi(m.prodi),
      peminatanId: m.peminatanId,
      peminatan: this.transformPeminatan(m.peminatan),
      dosenPa: this.transformDosen(m.dosenPaRel),
      pembimbing1: this.transformDosen(m.pembimbing1Rel),
      pembimbing2: this.transformDosen(m.pembimbing2Rel),
      nama: m.user?.nama,
    };
  }

  private transformDosen(d: any) {
    if (!d) return null;
    return {
      ...d,
      noHp: d.noHp,
      urlTtd: d.urlTtd,
      prodiId: d.prodiId,
      nama: d.user?.nama,
    };
  }

  private transformProdi(p: any) {
    if (!p) return null;
    return {
      id: p.id,
      namaProdi: p.namaProdi,
      fakultasId: p.fakultasId,
    };
  }

  private transformPeminatan(p: any) {
    if (!p) return null;
    return {
      id: p.id,
      namaPeminatan: p.namaPeminatan,
      prodiId: p.prodiId,
    };
  }
}

export const ranpelService = new RanpelService();
