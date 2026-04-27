import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateUjianInput, UpdateUjianInput } from "../schemas/ujian.schema";
import { HttpError } from "../../utils/http-error";
import { pdfService } from "./pdf.service";
import { createPaginationMeta } from "@/utils/pagination";
import { mailService } from "./mail.service";

const UJIAN_SELECT = {
  id: true,
  pendaftaranUjianId: true,
  hariUjian: true,
  jadwalUjian: true,
  waktuMulai: true,
  waktuSelesai: true,
  ruanganId: true,
  keputusanId: true,
  nilaiAkhir: true,
  nilaiHuruf: true,
  hasil: true,
  status: true,
  nilaiDifinalisasi: true,
  tanggalFinalisasi: true,
  catatanRevisi: true,
  pendaftaranUjian: {
    select: {
      id: true,
      mahasiswaId: true,
      jenisUjianId: true,
      rancanganPenelitianId: true,
      status: true,
      rancanganPenelitian: { select: { id: true, judulPenelitian: true } },
      mahasiswa: {
        select: {
          id: true,
          nim: true,
          user: { select: { id: true, nama: true, email: true } },
        },
      },
      jenisUjian: { select: { id: true, namaJenis: true } },
    },
  },
  ruangan: { select: { id: true, namaRuangan: true } },
  pengujiUjians: {
    select: {
      id: true,
      dosenId: true,
      peran: true,
      hadir: true,
      tanggalAbsen: true,
      dosen: {
        select: {
          id: true,
          nidn: true,
          user: { select: { id: true, nama: true } },
        },
      },
    },
  },
  keputusan: { select: { id: true, namaKeputusan: true } },
  penilaians: {
    select: {
      ujianId: true,
      dosenId: true,
      komponenPenilaianId: true,
      nilai: true,
      komentar: true,
      sudahSubmit: true,
      dosen: { select: { id: true, user: { select: { nama: true } } } },
      komponenPenilaian: {
        select: {
          id: true,
          kriteria: true,
          indikatorPenilaian: true,
          bobotKomponenPerans: {
            select: {
              id: true,
              peran: true,
              bobot: true,
            },
          },
        },
      },
    },
  },
};

export class UjianService {
  async getAll(params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 10 } = params;
    try {
      const where: Prisma.UjianWhereInput = {};
      const [list, total] = await Promise.all([
        prisma.ujian.findMany({
          where,
          skip,
          take,
          select: UJIAN_SELECT,
          orderBy: { id: "desc" },
        }),
        prisma.ujian.count({ where }),
      ]);

      return {
        data: list.map((u) => this.transformUjian(u)),
        meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
      };
    } catch (error: any) {
      throw new HttpError(500, error.message || "Gagal mengambil data ujian");
    }
  }

  async getById(id: string) {
    if (!id || isNaN(Number(id))) return null;
    try {
      const ujian = await prisma.ujian.findUnique({
        where: { id: Number(id) },
        select: {
          ...UJIAN_SELECT,
          penilaians: {
            select: {
              ujianId: true,
              dosenId: true,
              komponenPenilaianId: true,
              nilai: true,
              komentar: true,
              sudahSubmit: true,
              dosen: { select: { id: true, user: { select: { nama: true } } } },
              komponenPenilaian: {
                select: {
                  id: true,
                  kriteria: true,
                  indikatorPenilaian: true,
                  bobotKomponenPerans: {
                    select: {
                      id: true,
                      peran: true,
                      bobot: true
                    }
                  },
                },
              },
            },
          },
        },
      });
      if (!ujian) return null;
      return this.transformUjian(ujian);
    } catch (error: any) {
      console.error("DEBUG [UjianService.getById]:", error.message);
      throw new HttpError(500, error.message || "Gagal mengambil detail ujian");
    }
  }

  async getByMahasiswa(params: {
    mahasiswaId: string;
    namaJenis?: string;
    skip?: number;
    take?: number;
  }) {
    const { mahasiswaId, namaJenis, skip = 0, take = 10 } = params;
    if (!mahasiswaId || isNaN(Number(mahasiswaId))) {
      return { data: [], meta: createPaginationMeta(0, 1, take) };
    }

    const where: Prisma.UjianWhereInput = {
      pendaftaranUjian: {
        mahasiswaId: Number(mahasiswaId),
        ...(namaJenis ? { jenisUjian: { namaJenis: { contains: namaJenis, mode: 'insensitive' } } } : {})
      }
    };

    const [list, total] = await Promise.all([
      prisma.ujian.findMany({
        where,
        skip,
        take,
        select: UJIAN_SELECT,
        orderBy: { id: "desc" },
      }),
      prisma.ujian.count({ where }),
    ]);

    return {
      data: list.map((u) => this.transformUjian(u)),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async store(payload: CreateUjianInput) {
    const result = await prisma.ujian.create({
      data: {
        pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
        hariUjian: payload.hari_ujian,
        jadwalUjian: payload.jadwal_ujian ? new Date(payload.jadwal_ujian) : null,
        waktuMulai: payload.waktu_mulai,
        waktuSelesai: payload.waktu_selesai,
        ruanganId: payload.ruangan_id ? Number(payload.ruangan_id) : null,
        status: (payload.status as any) || "dijadwalkan",
      },
      select: UJIAN_SELECT,
    });
    return this.transformUjian(result);
  }

  async createScheduling(payload: any) {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Update Ujian record
      const ujianData = {
        pendaftaranUjianId: Number(payload.pendaftaranUjianId),
        hariUjian: payload.hariUjian,
        jadwalUjian: new Date(payload.jadwalUjian),
        waktuMulai: new Date(payload.waktuMulai),
        waktuSelesai: new Date(payload.waktuSelesai),
        ruanganId: Number(payload.ruanganId),
        status: "dijadwalkan" as any,
      };

      const ujian = await tx.ujian.upsert({
        where: { pendaftaranUjianId: Number(payload.pendaftaranUjianId) },
        update: ujianData,
        create: ujianData,
      });

      // 2. Handle Penguji List (Clean then Insert)
      await tx.pengujiUjian.deleteMany({ where: { ujianId: ujian.id } });

      if (payload.pengujiList && Array.isArray(payload.pengujiList)) {
        await tx.pengujiUjian.createMany({
          data: payload.pengujiList.map((p: any) => ({
            ujianId: ujian.id,
            dosenId: Number(p.dosenId),
            peran: p.peran,
          })),
        });
      }

      return await tx.ujian.findUnique({
        where: { id: ujian.id },
        select: UJIAN_SELECT,
      });
    });

    if (result && (result as any).pendaftaranUjian?.mahasiswa?.user?.email) {
      await this.sendSchedulingEmail(result);
    }

    return result;
  }

  private async sendSchedulingEmail(u: any) {
    if (u && u.pendaftaranUjian?.mahasiswa?.user?.email) {
      const m = u.pendaftaranUjian.mahasiswa;
      
      const tanggalStr = u.jadwalUjian 
        ? new Date(u.jadwalUjian).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) 
        : "-";
        
      const waktuStr = `${u.waktuMulai ? new Date(u.waktuMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-"} - ${u.waktuSelesai ? new Date(u.waktuSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-"}`;

      await mailService.sendExamScheduledNotification({
        studentEmail: m.user.email,
        studentNama: m.user.nama,
        jenisUjian: u.pendaftaranUjian.jenisUjian?.namaJenis || "Ujian",
        judul: u.pendaftaranUjian.rancanganPenelitian?.judulPenelitian || "-",
        hari: u.hariUjian || "-",
        tanggal: tanggalStr,
        waktu: waktuStr,
        ruangan: u.ruangan?.namaRuangan || "-",
      });
    }
  }

  async update(id: string, payload: UpdateUjianInput) {
    const dataUpdate: any = { ...payload };
    if (payload.jadwal_ujian) dataUpdate.jadwalUjian = new Date(payload.jadwal_ujian);
    if (payload.pendaftaran_ujian_id)
      dataUpdate.pendaftaranUjianId = Number(payload.pendaftaran_ujian_id);
    if (payload.ruangan_id) dataUpdate.ruanganId = Number(payload.ruangan_id);
    if (payload.keputusan_id) dataUpdate.keputusanId = Number(payload.keputusan_id);

    const result = await prisma.ujian.update({
      where: { id: Number(id) },
      data: dataUpdate,
      select: UJIAN_SELECT,
    });

    if (result && (result as any).pendaftaranUjian?.mahasiswa?.user?.email) {
      await this.sendSchedulingEmail(result);
    }

    return this.transformUjian(result);
  }

  async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.pengujiUjian.deleteMany({ where: { ujianId: Number(id) } });
      await tx.penilaian.deleteMany({ where: { ujianId: Number(id) } });
      return await tx.ujian.delete({ where: { id: Number(id) } });
    });
  }

  async getFormPenilaian(id: string, userId: string) {
    const uId = Number(userId);
    const ujian = await prisma.ujian.findUnique({
      where: { id: Number(id) },
      include: {
        pendaftaranUjian: {
          select: { jenisUjianId: true }
        },
        penilaians: {
          include: {
            dosen: { include: { user: { select: { nama: true } } } },
            komponenPenilaian: {
               include: { bobotKomponenPerans: true }
            }
          }
        },
        pengujiUjians: {
          include: {
            dosen: { include: { user: { select: { nama: true } } } }
          }
        }
      }
    });

    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");

    const myPengujiRecord = ujian.pengujiUjians.find(p => p.dosenId === uId);
    if (!myPengujiRecord) throw new HttpError(403, "Anda tidak terdaftar sebagai penguji");

    const components = await prisma.komponenPenilaian.findMany({
      where: { 
        jenisUjianId: ujian.pendaftaranUjian.jenisUjianId,
        bobotKomponenPerans: { some: { peran: myPengujiRecord.peran, bobot: { gt: 0 } } }
      },
      include: { 
        bobotKomponenPerans: { where: { peran: myPengujiRecord.peran } },
        penilaians: {
          where: { dosenId: uId, ujianId: Number(id) }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    return {
      sudahSubmit: components.length > 0 && components.every(c => c.penilaians.length > 0 && c.penilaians[0].sudahSubmit),
      components: components.map(c => ({
        id: c.id,
        kriteria: c.kriteria,
        penilaians: c.penilaians,
        bobotKomponenPerans: c.bobotKomponenPerans
      })),
      allScores: ujian.penilaians.map(p => ({
        dosenId: p.dosenId,
        komponenPenilaianId: p.komponenPenilaianId,
        nilai: Number(p.nilai),
        sudahSubmit: p.sudahSubmit,
        dosen: p.dosen,
        komponenPenilaian: p.komponenPenilaian
      })),
      penguji: myPengujiRecord ? {
        dosenId: myPengujiRecord.dosenId,
        dosen: myPengujiRecord.dosen
      } : null,
      ujian: {
        nilaiDifinalisasi: ujian.nilaiDifinalisasi
      }
    };
  }

  async getSchedulingFormData(pendaftaranId: number) {
    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id: pendaftaranId },
      include: {
        mahasiswa: { include: { user: true } },
        jenisUjian: true,
        rancanganPenelitian: true,
        ujian: {
          include: {
            pengujiUjians: {
              include: { dosen: { include: { user: true } } }
            }
          }
        }
      }
    });

    if (!pendaftaran) throw new HttpError(404, "Pendaftaran tidak ditemukan");

    const [rooms, lecturers] = await Promise.all([
      prisma.ruangan.findMany({ orderBy: { namaRuangan: "asc" } }),
      prisma.dosen.findMany({
        where: {
          user: {
            role: {
              name: { in: ["dosen", "kaprodi", "sekprodi"] },
            },
          },
        },
        include: { user: true },
        orderBy: { user: { nama: "asc" } },
      }),
    ]);

    return {
      pendaftaranUjian: pendaftaran,
      rooms,
      lecturers: lecturers.map(l => ({
        id: l.id,
        nama: l.user.nama,
        user: { nama: l.user.nama }
      })),
      defaultExaminers: pendaftaran.ujian?.pengujiUjians.map(p => ({
        dosenId: p.dosenId,
        peran: p.peran
      }))
    };
  }

  async getKeputusanOptions() {
    return await prisma.keputusan.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async hitungNilaiAkhir(ujianId: number) {
    return await prisma.$transaction(async (tx) => {
      const ujian = await tx.ujian.findUnique({
        where: { id: ujianId },
        include: {
          pengujiUjians: { include: { dosen: true } },
          pendaftaranUjian: { include: { jenisUjian: { include: { syarats: true } } } },
        },
      });

      if (!ujian) throw new Error("Ujian tidak ditemukan");

      const komponenPenilaians = await tx.komponenPenilaian.findMany({
        where: { jenisUjianId: ujian.pendaftaranUjian.jenisUjianId },
        include: { bobotKomponenPerans: true },
      });

      const presentDosenIds = ujian.pengujiUjians.map((px: any) => px.dosenId);
      if (presentDosenIds.length === 0) return null;

      const penilaians = await tx.penilaian.findMany({
        where: { ujianId, dosenId: { in: presentDosenIds } },
      });

      let totalWeightedScore = 0;

      for (const px of ujian.pengujiUjians) {
        let dosenTotalScore = 0;
        for (const kp of komponenPenilaians) {
          const bp = kp.bobotKomponenPerans.find((b) => b.peran === px.peran);
          if (!bp) continue;

          const p = penilaians.find(
            (val) => val.dosenId === px.dosenId && val.komponenPenilaianId === kp.id
          );
          const score = p ? Number(p.nilai) : 0;
          dosenTotalScore += score * (Number(bp.bobot) / 100);
        }
        totalWeightedScore += dosenTotalScore;
      }

      const finalScore = totalWeightedScore / presentDosenIds.length;
      
      let grade = "E";
      let hasil: "lulus" | "tidak_lulus" = "tidak_lulus";

      if (finalScore >= 80) grade = "A";
      else if (finalScore >= 75) grade = "B+";
      else if (finalScore >= 70) grade = "B";
      else if (finalScore >= 65) grade = "C+";
      else if (finalScore >= 60) grade = "C";
      else if (finalScore >= 50) grade = "D";

      if (finalScore >= 60) hasil = "lulus";

      return await tx.ujian.update({
        where: { id: ujianId },
        data: {
          nilaiAkhir: new Prisma.Decimal(finalScore),
          nilaiHuruf: grade,
          hasil: hasil,
        },
      });
    });
  }

  private transformUjian(u: any) {
    if (!u) return null;
    return {
      ...u,
      pendaftaranUjian: u.pendaftaranUjian ? {
        ...u.pendaftaranUjian,
        mahasiswa: u.pendaftaranUjian.mahasiswa ? {
          ...u.pendaftaranUjian.mahasiswa,
          user: u.pendaftaranUjian.mahasiswa.user
        } : null,
        jenisUjian: u.pendaftaranUjian.jenisUjian,
        rancanganPenelitian: u.pendaftaranUjian.rancanganPenelitian
      } : null,
      pendaftaran: u.pendaftaranUjian ? {
        id: u.pendaftaranUjian.id,
        mahasiswa_id: u.pendaftaranUjian.mahasiswaId,
        mahasiswa: u.pendaftaranUjian.mahasiswa ? {
          id: u.pendaftaranUjian.mahasiswa.id,
          nim: u.pendaftaranUjian.mahasiswa.nim,
          nama: u.pendaftaranUjian.mahasiswa.user?.nama,
        } : null,
        jenis_ujian: u.pendaftaranUjian.jenisUjian?.namaJenis,
        judul: u.pendaftaranUjian.rancanganPenelitian?.judulPenelitian,
      } : null,
      ruangan: u.ruangan ? { id: u.ruangan.id, nama_ruangan: u.ruangan.namaRuangan, namaRuangan: u.ruangan.namaRuangan } : null,
      keputusan: u.keputusan ? { id: u.keputusan.id, nama_keputusan: u.keputusan.namaKeputusan } : null,
      nilai_akhir: u.nilaiAkhir ? Number(u.nilaiAkhir) : 0,
      nilai_huruf: u.nilaiHuruf,
      nilai_difinalisasi: u.nilaiDifinalisasi,
      tanggal_finalisasi: u.tanggalFinalisasi,
      catatan_revisi: u.catatanRevisi,
      penguji: (u.pengujiUjians || []).map((px: any) => ({
        id: px.id,
        dosenId: px.dosenId,
        dosen_id: px.dosenId,
        nama: px.dosen?.user?.nama,
        dosen: px.dosen,
        peran: px.peran,
        hadir: px.hadir,
        tanggal_absen: px.tanggalAbsen,
      })),
      penilaians: u.penilaians || [],
    };
  }

  // --- New Exam Execution Methods ---

  async submitAbsensi(
    userId: number,
    ujianId: number,
    absensiList: { pengujiUjianId: number; hadir: boolean }[],
  ) {
    const penguji = await prisma.pengujiUjian.findFirst({
      where: { ujianId, dosenId: userId, peran: "ketua_penguji" },
    });
    if (!penguji)
      throw new HttpError(403, "Hanya ketua penguji yang bisa input absensi");

    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: { pengujiUjians: true },
    });
    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");
    if (ujian.status !== "dijadwalkan")
      throw new HttpError(
        400,
        "Absensi hanya bisa disubmit saat status ujian 'dijadwalkan'",
      );

    const alreadySubmitted = ujian.pengujiUjians.some(
      (p: any) => p.tanggalAbsen,
    );
    if (alreadySubmitted)
      throw new HttpError(400, "Absensi sudah pernah disubmit sebelumnya");

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      for (const item of absensiList) {
        await tx.pengujiUjian.update({
          where: { id: item.pengujiUjianId },
          data: { hadir: item.hadir, tanggalAbsen: now },
        });
      }
      return await tx.pengujiUjian.findMany({ where: { ujianId } });
    });
  }

  async getFormInputNilai(userId: number, ujianId: number) {
    const penguji = await prisma.pengujiUjian.findFirst({
      where: { ujianId, dosenId: userId },
    });
    if (!penguji)
      throw new HttpError(403, "Anda tidak terdaftar sebagai penguji");

    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: {
        pendaftaranUjian: { include: { jenisUjian: true } },
        pengujiUjians: true,
      },
    });
    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");

    const components = await prisma.komponenPenilaian.findMany({
      where: {
        jenisUjianId: ujian.pendaftaranUjian.jenisUjianId,
        bobotKomponenPerans: { some: { peran: penguji.peran, bobot: { gt: 0 } } },
      },
      include: {
        bobotKomponenPerans: { where: { peran: penguji.peran } },
        penilaians: { where: { ujianId, dosenId: userId } },
      },
    });

    const allScores = await prisma.penilaian.findMany({
      where: { ujianId },
      include: {
        dosen: { include: { user: true } },
        komponenPenilaian: {
          include: { bobotKomponenPerans: true },
        },
      },
    });

    const sudahSubmit =
      components.length > 0 &&
      components.every((c: any) => c.penilaians[0]?.sudahSubmit);

    return {
      penguji,
      components,
      allScores,
      ujian,
      sudahSubmit,
    };
  }

  async simpanDraftNilai(
    userId: number,
    ujianId: number,
    penilaianList: {
      komponenPenilaianId: number;
      nilai: number;
      komentar?: string;
    }[],
  ) {
    return await this._upsertPenilaian(userId, ujianId, penilaianList, false);
  }

  async submitNilaiFinal(
    userId: number,
    ujianId: number,
    penilaianList: {
      komponenPenilaianId: number;
      nilai: number;
      komentar?: string;
    }[],
  ) {
    return await this._upsertPenilaian(userId, ujianId, penilaianList, true);
  }

  private async _upsertPenilaian(
    userId: number,
    ujianId: number,
    penilaianList: {
      dosenId?: number; // Optional: only used by chairperson to override
      komponenPenilaianId: number;
      nilai: number;
      komentar?: string;
    }[],
    isFinal: boolean,
  ) {
    const me = await prisma.pengujiUjian.findFirst({
      where: { ujianId, dosenId: userId },
    });
    if (!me)
      throw new HttpError(
        403,
        "Hanya penguji yang terdaftar yang bisa mengakses halaman ini",
      );

    const isKetua = me.peran === "ketua_penguji";

    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } });
    if (ujian?.nilaiDifinalisasi)
      throw new HttpError(400, "Nilai sudah difinalisasi");

    const components = await prisma.komponenPenilaian.findMany();

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      for (const p of penilaianList) {
        if (p.nilai < 0 || p.nilai > 100)
          throw new HttpError(400, "Nilai valid 0-100");

        const targetDosenId =
          p.dosenId && p.dosenId !== userId && isKetua ? p.dosenId : userId;
          
        // Re-check role of targetDosenId if not the same as userId
        let targetRole = me.peran;
        if (targetDosenId !== userId) {
          const targetPenguji = await tx.pengujiUjian.findFirst({ where: { ujianId, dosenId: targetDosenId } });
          targetRole = targetPenguji?.peran || me.peran;
        }

        // FILTER: Penguji 1 dan 2 tidak menilai Bimbingan
        const comp = components.find(c => c.id === p.komponenPenilaianId);
        if (comp?.kriteria === "Bimbingan" && (targetRole === "penguji_1" || targetRole === "penguji_2")) {
          // If already exists, delete it. If not, just skip.
          await tx.penilaian.deleteMany({
            where: {
              ujianId,
              dosenId: targetDosenId,
              komponenPenilaianId: p.komponenPenilaianId
            }
          });
          continue; 
        }

        await tx.penilaian.upsert({
          where: {
            ujianId_dosenId_komponenPenilaianId: {
              ujianId,
              dosenId: targetDosenId,
              komponenPenilaianId: p.komponenPenilaianId,
            },
          },
          update: {
            nilai: p.nilai,
            komentar: p.komentar || null,
            sudahSubmit: isFinal,
            submittedAt: isFinal ? now : null,
          },
          create: {
            ujianId,
            dosenId: targetDosenId,
            komponenPenilaianId: p.komponenPenilaianId,
            nilai: p.nilai,
            komentar: p.komentar || null,
            sudahSubmit: isFinal,
            submittedAt: isFinal ? now : null,
          },
        });
      }
      return await tx.penilaian.findMany({
        where: { ujianId, dosenId: userId },
      });
    });
  }

  async finalisasiNilai(userId: number, ujianId: number) {
    const ketua = await prisma.pengujiUjian.findFirst({
      where: { ujianId, dosenId: userId, peran: "ketua_penguji" },
    });
    if (!ketua)
      throw new HttpError(403, "Hanya ketua penguji yang bisa finalisasi");

    const ujian: any = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: {
        pendaftaranUjian: { include: { jenisUjian: true } },
        pengujiUjians: { where: { hadir: true } },
      },
    });
    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");
    if (ujian.nilaiDifinalisasi)
      throw new HttpError(400, "Nilai sudah difinalisasi");

    const presentDosenIds = ujian.pengujiUjians.map((p: any) => p.dosenId);
    if (presentDosenIds.length === 0)
      throw new HttpError(400, "Tidak ada penguji yang hadir");

    const penilaians = await prisma.penilaian.findMany({
      where: { ujianId, dosenId: { in: presentDosenIds } },
      include: {
        komponenPenilaian: { include: { bobotKomponenPerans: true } },
      },
    });

    const rolesMap = new Map<number, string>();
    ujian.pengujiUjians.forEach((p: any) => rolesMap.set(p.dosenId, p.peran));

    let sumNilaiBobot = 0;
    let sumBobot = 0;
    let anyScoreUnder60 = false;

    for (const p of penilaians) {
      const peran = rolesMap.get(p.dosenId);
      const bobotData = p.komponenPenilaian.bobotKomponenPerans.find(
        (b: any) => b.peran === peran,
      );
      const bobot = bobotData?.bobot || 0;
      const nilai = Number(p.nilai) || 0;

      if (bobot > 0 && nilai < 60) {
        anyScoreUnder60 = true;
      }

      sumNilaiBobot += nilai * bobot;
      sumBobot += bobot;
    }

    if (sumBobot === 0)
      throw new HttpError(400, "Tidak dapat menghitung, bobot 0");

    const nilaiAkhir = sumNilaiBobot / sumBobot;

    let nilaiHuruf = "E";
    if (nilaiAkhir >= 80) nilaiHuruf = "A";
    else if (nilaiAkhir >= 70) nilaiHuruf = "B";
    else if (nilaiAkhir >= 60) nilaiHuruf = "C";
    else if (nilaiAkhir >= 56) nilaiHuruf = "D";

    // Ketentuan: Lulus jika minimal C (nilai akhir >= 60)
    const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);
    const hasilFinal =
      lulusByGrade && !anyScoreUnder60 ? "lulus" : "tidak_lulus";

    return await prisma.ujian.update({
      where: { id: ujianId },
      data: {
        nilaiAkhir: nilaiAkhir,
        nilaiHuruf: nilaiHuruf,
        hasil: hasilFinal,
        nilaiDifinalisasi: true,
        tanggalFinalisasi: new Date(),
        finalisasiOleh: userId,
      },
    });
  }

  async getDataKeputusan(ujianId: number) {
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: { pendaftaranUjian: true },
    });
    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");

    return await prisma.keputusan.findMany({
      where: {
        OR: [
          { jenisUjianId: ujian.pendaftaranUjian.jenisUjianId },
          { jenisUjianId: null },
        ],
        aktif: true,
      },
    });
  }

  async submitKeputusan(
    userId: number,
    ujianId: number,
    payload: { keputusanId: number; hasil: any; catatanRevisi?: string },
  ) {
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: { pengujiUjians: true },
    });
    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");
    if (!ujian.nilaiDifinalisasi)
      throw new HttpError(400, "Nilai harus difinalisasi");

    const sekretaris = ujian.pengujiUjians.find(
      (p: any) => p.peran === "sekretaris_penguji",
    );
    const isSekHadir = sekretaris?.hadir || false;

    let allowed = false;
    if (isSekHadir) {
      if (sekretaris?.dosenId === userId) allowed = true;
    } else {
      const ketua = ujian.pengujiUjians.find(
        (p: any) => p.peran === "ketua_penguji",
      );
      if (ketua?.dosenId === userId) allowed = true;
    }

    if (!allowed)
      throw new HttpError(403, "Anda tidak memiliki hak input keputusan");

    return await prisma.ujian.update({
      where: { id: ujianId },
      data: {
        keputusanId: payload.keputusanId,
        hasil: payload.hasil,
        catatanRevisi: payload.catatanRevisi || null,
        status: "selesai" as any,
      },
    });
  }
}

export const ujianService = new UjianService();
