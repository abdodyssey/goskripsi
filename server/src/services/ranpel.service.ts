import { prisma } from "../utils/prisma";
import {
  CreateRanpelInput,
  UpdateRanpelInput,
  UpdatePengajuanRanpelInput,
} from "../schemas/ranpel.schema";
import { mailService } from "./mail.service";

export class RanpelService {
  async getAllRanpel() {
    const list = await prisma.rancanganPenelitian.findMany();
    return list.map((r) => this.transformRanpel(r));
  }

  async getAllPengajuan(userId?: string, roles: string[] = []) {
    const where: any = {};

    const isManagement = roles.some((r) =>
      ["admin", "superadmin", "kaprodi", "sekprodi"].includes(r),
    );

    if (userId && roles.includes("dosen") && !isManagement) {
      where.mahasiswa = {
        dosenPa: Number(userId),
      };
    }

    const list = await prisma.pengajuanRancanganPenelitian.findMany({
      where,
      include: {
        rancanganPenelitian: true,
        mahasiswa: {
          include: {
            user: true,
            prodi: true,
            peminatan: true,
            pembimbing1Rel: { include: { user: true } },
            pembimbing2Rel: { include: { user: true } },
            dosenPaRel: { include: { user: true } },
          },
        },
      },
      orderBy: { tanggalPengajuan: "desc" },
    });

    return list.map((p) => this.transformPengajuan(p));
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

    // Send Notification Async (Background)
    const mhs = await prisma.mahasiswa.findUnique({
      where: { id: Number(mahasiswaId) },
      include: {
        user: true,
        dosenPaRel: { include: { user: true } },
      },
    });

    if (mhs?.dosenPaRel?.user?.email) {
      mailService.sendRanpelSubmissionNotification(
        mhs.dosenPaRel.user.email,
        mhs.dosenPaRel.user.nama,
        mhs.user.nama,
        payload.judul_penelitian
      );
    }

    return this.transformRanpel(result.rancanganPenelitian);
  }

  async updateRanpelByMahasiswa(
    rancanganPenelitianId: string,
    payload: UpdateRanpelInput,
  ) {
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

    if (payload.catatan_dosen_pa !== undefined) {
      dataUpdate.catatanDosenPa = payload.catatan_dosen_pa;
    }
    if (payload.catatan_kaprodi !== undefined) {
      dataUpdate.catatanKaprodi = payload.catatan_kaprodi;
    }

    // Section comments PA
    if (payload.komen_pa_masalah !== undefined) dataUpdate.komenPaMasalah = payload.komen_pa_masalah;
    if (payload.komen_pa_solusi !== undefined) dataUpdate.komenPaSolusi = payload.komen_pa_solusi;
    if (payload.komen_pa_hasil !== undefined) dataUpdate.komenPaHasil = payload.komen_pa_hasil;
    if (payload.komen_pa_data !== undefined) dataUpdate.komenPaData = payload.komen_pa_data;
    if (payload.komen_pa_metode !== undefined) dataUpdate.komenPaMetode = payload.komen_pa_metode;

    // Section comments Kaprodi
    if (payload.komen_kpr_masalah !== undefined) dataUpdate.komenKprMasalah = payload.komen_kpr_masalah;
    if (payload.komen_kpr_solusi !== undefined) dataUpdate.komenKprSolusi = payload.komen_kpr_solusi;
    if (payload.komen_kpr_hasil !== undefined) dataUpdate.komenKprHasil = payload.komen_kpr_hasil;
    if (payload.komen_kpr_data !== undefined) dataUpdate.komenKprData = payload.komen_kpr_data;
    if (payload.komen_kpr_metode !== undefined) dataUpdate.komenKprMetode = payload.komen_kpr_metode;

    const result = await prisma.pengajuanRancanganPenelitian.update({
      where: { id: Number(pengajuanId) },
      data: dataUpdate,
      include: {
        rancanganPenelitian: true,
        mahasiswa: {
          include: {
            user: true,
            prodi: true,
            dosenPaRel: { include: { user: true } },
          },
        },
      },
    });

    // Send Notification to Mahasiswa
    if (result.mahasiswa?.user?.email) {
      let status = "";
      let catatan = "";
      let reviewerNama = "";

      if (payload.status_dosen_pa) {
        status = payload.status_dosen_pa;
        catatan = payload.catatan_dosen_pa || "";
        reviewerNama = result.mahasiswa.dosenPaRel?.user?.nama || "Dosen PA";
      } else if (payload.status_kaprodi) {
        status = payload.status_kaprodi;
        catatan = payload.catatan_kaprodi || "";
        reviewerNama = "Ketua Program Studi";
      }

      if (status && status !== "menunggu") {
        mailService.sendRanpelReviewNotification(
          result.mahasiswa.user.email,
          result.mahasiswa.user.nama,
          reviewerNama,
          status,
          catatan
        );
      }
    }

    return this.transformPengajuan(result);
  }

  async getPengajuanByMahasiswa(mahasiswaId: string) {
    const list = await prisma.pengajuanRancanganPenelitian.findMany({
      where: { mahasiswaId: Number(mahasiswaId) },
      include: {
        rancanganPenelitian: true,
        mahasiswa: {
          include: {
            user: true,
            prodi: true,
            dosenPaRel: { include: { user: true } },
          },
        },
      },
    });
    return list.map((p) => this.transformPengajuan(p));
  }

  async getPengajuanById(id: string) {
    const p = await prisma.pengajuanRancanganPenelitian.findUnique({
      where: { id: Number(id) },
      include: {
        rancanganPenelitian: true,
        mahasiswa: {
          include: {
            user: true,
            prodi: true,
            dosenPaRel: { include: { user: true } },
          },
        },
      },
    });
    return this.transformPengajuan(p);
  }

  async deleteRanpel(id: string) {
    return await prisma.rancanganPenelitian.delete({
      where: { id: Number(id) },
    });
  }

  async deletePengajuan(id: string) {
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
      catatanDosenPa: p.catatanDosenPa,
      tanggalReviewPa: p.tanggalReviewPa,
      statusKaprodi: p.statusKaprodi,
      catatanKaprodi: p.catatanKaprodi,
      tanggalReviewKaprodi: p.tanggalReviewKaprodi,

      // PA Section Comments
      komenPaMasalah: p.komenPaMasalah,
      komenPaSolusi: p.komenPaSolusi,
      komenPaHasil: p.komenPaHasil,
      komenPaData: p.komenPaData,
      komenPaMetode: p.komenPaMetode,

      // Kaprodi Section Comments
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
