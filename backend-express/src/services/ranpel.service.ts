import { prisma } from "../utils/prisma";
import {
  CreateRanpelInput,
  UpdateRanpelInput,
  UpdatePengajuanRanpelInput,
} from "../schemas/ranpel.schema";

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
    return await prisma.$transaction(async (tx) => {
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

      return this.transformRanpel(rancanganPenelitian);
    });
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
