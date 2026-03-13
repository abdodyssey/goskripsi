import { prisma } from "../utils/prisma";
import { Prisma } from "@prisma/client";
import { CreateUjianInput, UpdateUjianInput } from "../schemas/ujian.schema";
import { HttpError } from "../utils/http-error";
import { pdfService } from "./pdf.service";

export class UjianService {
  async getAll() {
    return await prisma.ujian.findMany({
      include: {
        pendaftaranUjian: {
          include: {
            rancanganPenelitian: true,
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
          },
        },
        ruangan: true,
        pengujiUjians: { include: { dosen: { include: { user: true } } } },
        keputusan: true,
        penilaians: {
          include: {
            dosen: { include: { user: true } },
            komponenPenilaian: {
              include: {
                bobotKomponenPerans: true,
              },
            },
          },
        },
      },
    });
  }

  async getById(id: string) {
    return await prisma.ujian.findUnique({
      where: { id: Number(id) },
      include: {
        pendaftaranUjian: {
          include: {
            rancanganPenelitian: true,
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
          },
        },
        ruangan: true,
        pengujiUjians: { include: { dosen: { include: { user: true } } } },
        keputusan: true,
        penilaians: {
          include: {
            dosen: { include: { user: true } },
            komponenPenilaian: {
              include: {
                bobotKomponenPerans: true,
              },
            },
          },
        },
      },
    });
  }

  async getByMahasiswa(mahasiswaId: string, namaJenis?: string) {
    return await prisma.ujian.findMany({
      where: {
        pendaftaranUjian: {
          mahasiswaId: Number(mahasiswaId),
          ...(namaJenis && {
            jenisUjian: {
              namaJenis: { contains: namaJenis },
            },
          }),
        },
      },
      include: {
        pendaftaranUjian: {
          include: {
            rancanganPenelitian: true,
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
          },
        },
        ruangan: true,
        pengujiUjians: { include: { dosen: { include: { user: true } } } },
        keputusan: true,
        penilaians: {
          include: {
            dosen: { include: { user: true } },
            komponenPenilaian: {
              include: {
                bobotKomponenPerans: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async store(payload: CreateUjianInput) {
    return await prisma.$transaction(async (tx) => {
      let ruanganId = null;
      if (payload.ruangan_id) ruanganId = Number(payload.ruangan_id);

      let keputusanId = null;
      if (payload.keputusan_id) keputusanId = Number(payload.keputusan_id);

      const ujian = await tx.ujian.create({
        data: {
          pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
          hariUjian: payload.hari_ujian as any,
          jadwalUjian: payload.jadwal_ujian
            ? new Date(payload.jadwal_ujian)
            : null,
          waktuMulai: payload.waktu_mulai
            ? new Date(payload.waktu_mulai)
            : null,
          waktuSelesai: payload.waktu_selesai
            ? new Date(payload.waktu_selesai)
            : null,
          ruanganId: ruanganId,
          keputusanId: keputusanId,
        },
      });

      if (payload.penguji && payload.penguji.length > 0) {
        const syncData = payload.penguji.map((p: any) => ({
          ujianId: ujian.id,
          dosenId: Number(p.dosenId),
          peran: p.peran,
        }));
        await tx.pengujiUjian.createMany({ data: syncData });
      }

      return await tx.ujian.findUnique({
        where: { id: ujian.id },
        include: { pengujiUjians: true, pendaftaranUjian: true },
      });
    });
  }

  async update(id: string, payload: UpdateUjianInput) {
    return await prisma.$transaction(async (tx) => {
      const ujian = await tx.ujian.findUnique({ where: { id: Number(id) } });
      if (!ujian) throw new Error("Ujian tidak ditemukan");

      const dataUpdate: any = { ...payload };

      delete dataUpdate.penguji; // hapus relasional input arraynya
      delete dataUpdate.mahasiswaId;
      delete dataUpdate.jenisUjianId;

      if (payload.ruangan_id) dataUpdate.ruanganId = Number(payload.ruangan_id);
      if (payload.keputusan_id)
        dataUpdate.keputusanId = Number(payload.keputusan_id);

      if (payload.hari_ujian) dataUpdate.hariUjian = payload.hari_ujian as any;
      if (payload.jadwal_ujian)
        dataUpdate.jadwalUjian = new Date(payload.jadwal_ujian);
      if (payload.waktu_mulai)
        dataUpdate.waktuMulai = new Date(payload.waktu_mulai);
      if (payload.waktu_selesai)
        dataUpdate.waktuSelesai = new Date(payload.waktu_selesai);

      // Auto set hasil kalau dikirim nilaiAkhir tapi gak ada hasil
      if (payload.nilai_akhir !== undefined && payload.hasil === undefined) {
        dataUpdate.hasil =
          Number(payload.nilai_akhir) >= 70 ? "lulus" : "tidak_lulus";
        console.log(payload.nilai_akhir);
      }

      const updatedUjian = await tx.ujian.update({
        where: { id: Number(id) },
        data: dataUpdate,
      });

      // update status pendaftaran jika jadwal disediakan
      if (
        payload.jadwal_ujian &&
        payload.jadwal_ujian !== ujian.jadwalUjian?.toISOString()
      ) {
        await tx.ujian.update({
          where: { id: ujian.id },
          data: { status: "dijadwalkan" as any },
        });
      }

      if (payload.penguji) {
        // Sync operation: hapus dan insert
        await tx.pengujiUjian.deleteMany({ where: { ujianId: Number(id) } });
        const syncData = payload.penguji.map((p: any) => ({
          ujianId: ujian.id,
          dosenId: Number(p.dosenId),
          peran: p.peran,
        }));
        await tx.pengujiUjian.createMany({ data: syncData });
      }

      return await tx.ujian.findUnique({
        where: { id: Number(id) },
        include: {
          pengujiUjians: true,
          pendaftaranUjian: {
            include: { mahasiswa: { include: { user: true } } },
          },
        },
      });
    });
  }

  async delete(id: string) {
    return await prisma.ujian.delete({ where: { id: Number(id) } });
  }

  // Pure logic pemindahan dari model Ujian.php Laravel -> hitungNilaiAkhir()
  async hitungNilaiAkhir(ujianId: number, txIn?: Prisma.TransactionClient) {
    const callback = async (tx: Prisma.TransactionClient) => {
      const ujian: any = await tx.ujian.findUnique({
        where: { id: ujianId },
        include: {
          pendaftaranUjian: { include: { jenisUjian: true } },
          pengujiUjians: { where: { hadir: true } },
        },
      });
      if (!ujian || !ujian.pendaftaranUjian?.jenisUjian) return null;

      const presentDosenIds = ujian.pengujiUjians.map((px: any) => px.dosenId);
      if (presentDosenIds.length === 0) return null;

      const penilaian = await tx.penilaian.findMany({
        where: {
          ujianId: ujianId,
          dosenId: { in: presentDosenIds },
        },
        include: {
          komponenPenilaian: {
            include: { bobotKomponenPerans: true },
          },
        },
      });

      if (penilaian.length === 0) return null;

      const pengujiRolesMap = new Map<number, string>();
      ujian.pengujiUjians.forEach((p: any) =>
        pengujiRolesMap.set(p.dosenId, p.peran),
      );

      let sumNilaiBobot = 0;
      let sumBobot = 0;

      for (const p of penilaian) {
        const peran = pengujiRolesMap.get(p.dosenId);
        const bobotData = p.komponenPenilaian.bobotKomponenPerans.find(
          (b: any) => b.peran === peran,
        );
        const bobot = bobotData?.bobot || 0;
        const nilai = Number(p.nilai) || 0;

        sumNilaiBobot += nilai * bobot;
        sumBobot += bobot;
      }

      if (sumBobot === 0) return null;
      const nilaiAkhir = sumNilaiBobot / sumBobot;

      // Convert to Letter Grade
      let nilaiHuruf = "E";
      if (nilaiAkhir >= 80) nilaiHuruf = "A";
      else if (nilaiAkhir >= 70) nilaiHuruf = "B";
      else if (nilaiAkhir >= 60) nilaiHuruf = "C";
      else if (nilaiAkhir >= 56) nilaiHuruf = "D";

      // Ketentuan: Lulus jika minimal C (nilai akhir >= 60)
      const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);

      // Threshold check: No single component score < 60
      const hasLowScore = penilaian.some((p: any) => {
        // Only check components that have weight for this examiner role
        const peran = pengujiRolesMap.get(p.dosenId);
        const bobot =
          p.komponenPenilaian.bobotKomponenPerans.find(
            (b: any) => b.peran === peran,
          )?.bobot || 0;
        return bobot > 0 && Number(p.nilai) < 60;
      });

      const isLulus = lulusByGrade && !hasLowScore;

      await tx.ujian.update({
        where: { id: ujianId },
        data: {
          nilaiAkhir: nilaiAkhir,
          nilaiHuruf: nilaiHuruf,
          hasil: isLulus ? "lulus" : "tidak_lulus",
        },
      });

      return await tx.ujian.findUnique({ where: { id: ujianId } });
    };
    return txIn ? callback(txIn) : prisma.$transaction(callback);
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
        bobotKomponenPerans: { some: { peran: penguji.peran } },
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

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      for (const p of penilaianList) {
        if (p.nilai < 0 || p.nilai > 100)
          throw new HttpError(400, "Nilai valid 0-100");

        // Target dosenId is either specified (if requester is ketua) or self
        const targetDosenId =
          p.dosenId && p.dosenId !== userId && isKetua ? p.dosenId : userId;

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
        status: "selesai",
      },
    });
  }

  // --- New Scheduling Methods ---

  async getSchedulingFormData(pendaftaranId: string) {
    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id: Number(pendaftaranId) },
      include: {
        mahasiswa: {
          include: {
            user: true,
            pembimbing1Rel: { include: { user: true } },
            pembimbing2Rel: { include: { user: true } },
            prodi: true,
          },
        },
        jenisUjian: true,
        rancanganPenelitian: true,
        ujian: {
          include: {
            pengujiUjians: { include: { dosen: { include: { user: true } } } },
            ruangan: true,
          },
        },
      },
    });

    if (!pendaftaran)
      throw new HttpError(404, "Data pendaftaran tidak ditemukan");
    if (pendaftaran.status !== "diterima") {
      throw new HttpError(
        400,
        "Pendaftaran harus berstatus 'diterima' sebelum dijadwalkan",
      );
    }

    const lecturers = await prisma.dosen.findMany({
      where: { prodiId: pendaftaran.mahasiswa.prodiId, status: "aktif" },
      include: { user: true },
    });

    const rooms = await prisma.ruangan.findMany({
      where: { prodiId: pendaftaran.mahasiswa.prodiId },
    });

    // Auto-fill Pembimbing
    const defaultExaminers = [
      {
        dosenId: pendaftaran.mahasiswa.pembimbing1,
        peran: "ketua_penguji",
        nama: pendaftaran.mahasiswa.pembimbing1Rel?.user?.nama,
      },
      {
        dosenId: pendaftaran.mahasiswa.pembimbing2,
        peran: "sekretaris_penguji",
        nama: pendaftaran.mahasiswa.pembimbing2Rel?.user?.nama,
      },
    ];

    return {
      pendaftaran,
      lecturers,
      rooms,
      defaultExaminers,
    };
  }

  async createScheduling(payload: any) {
    console.log("[createScheduling] Received payload:", payload);
    const {
      pendaftaranUjianId,
      jadwalUjian,
      waktuMulai,
      waktuSelesai,
      hariUjian,
      ruanganId,
      pengujiList,
    } = payload;

    // Basic Validation
    if (new Date(waktuSelesai) <= new Date(waktuMulai)) {
      throw new HttpError(
        400,
        "Waktu selesai harus lebih besar dari waktu mulai",
      );
    }

    // Role validation
    const roles = pengujiList.map((p: any) => p.peran);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size !== 4 || roles.length !== 4) {
      throw new HttpError(
        400,
        "Ke-4 peran penguji harus terisi lengkap dan tidak boleh duplikat",
      );
    }

    // Single dose per roles
    const dosenIds = pengujiList.map((p: any) => p.dosenId);
    if (new Set(dosenIds).size !== 4) {
      throw new HttpError(
        400,
        "Satu dosen tidak boleh memegang lebih dari satu peran",
      );
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // Create Ujian
        const ujian = await tx.ujian.upsert({
          where: { pendaftaranUjianId: Number(pendaftaranUjianId) },
          update: {
            jadwalUjian: new Date(jadwalUjian),
            waktuMulai: new Date(waktuMulai),
            waktuSelesai: new Date(waktuSelesai),
            hariUjian: hariUjian,
            ruanganId: Number(ruanganId),
            status: "dijadwalkan",
          },
          create: {
            pendaftaranUjianId: Number(pendaftaranUjianId),
            jadwalUjian: new Date(jadwalUjian),
            waktuMulai: new Date(waktuMulai),
            waktuSelesai: new Date(waktuSelesai),
            hariUjian: hariUjian,
            ruanganId: Number(ruanganId),
            status: "dijadwalkan",
          },
        });

        // Clear + Re-insert Examiners
        await tx.pengujiUjian.deleteMany({ where: { ujianId: ujian.id } });
        for (const p of pengujiList as any[]) {
          await tx.pengujiUjian.create({
            data: {
              ujianId: ujian.id,
              dosenId: Number(p.dosenId),
              peran: p.peran as any,
            },
          });
        }

        // Mock notification
        console.log(
          `Notification sent to students and examiners for exam ID: ${ujian.id}`,
        );

        return await tx.ujian.findUnique({
          where: { id: ujian.id },
          include: {
            pengujiUjians: { include: { dosen: { include: { user: true } } } },
            pendaftaranUjian: {
              include: { mahasiswa: { include: { user: true } } },
            },
          },
        });
      });
    } catch (error) {
      console.error("[createScheduling] Error during transaction:", error);
      throw error;
    }
  }

  async updateScheduling(ujianId: string, payload: any) {
    console.log("[updateScheduling] Received payload:", payload);
    const {
      jadwalUjian,
      waktuMulai,
      waktuSelesai,
      hariUjian,
      ruanganId,
      pengujiList,
    } = payload;

    if (new Date(waktuSelesai) <= new Date(waktuMulai)) {
      throw new HttpError(
        400,
        "Waktu selesai harus lebih besar dari waktu mulai",
      );
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const ujian = await tx.ujian.update({
          where: { id: Number(ujianId) },
          data: {
            jadwalUjian: new Date(jadwalUjian),
            waktuMulai: new Date(waktuMulai),
            waktuSelesai: new Date(waktuSelesai),
            hariUjian: hariUjian,
            ruanganId: Number(ruanganId),
          },
        });

        if (pengujiList) {
          await tx.pengujiUjian.deleteMany({ where: { ujianId: ujian.id } });
          for (const p of pengujiList as any[]) {
            await tx.pengujiUjian.create({
              data: {
                ujianId: ujian.id,
                dosenId: Number(p.dosenId),
                peran: p.peran as any,
              },
            });
          }
        }

        console.log(`Update notification sent for exam ID: ${ujian.id}`);

        return await tx.ujian.findUnique({
          where: { id: ujian.id },
          include: {
            pengujiUjians: { include: { dosen: { include: { user: true } } } },
            pendaftaranUjian: {
              include: { mahasiswa: { include: { user: true } } },
            },
          },
        });
      });
    } catch (error) {
      console.error("[updateScheduling] Error during transaction:", error);
      throw error;
    }
  }

  async generateBeritaAcaraPdf(id: number) {
    const ujian = await prisma.ujian.findUnique({
      where: { id },
      include: {
        pendaftaranUjian: {
          include: {
            mahasiswa: {
              include: { user: true, prodi: true },
            },
            jenisUjian: true,
            rancanganPenelitian: true,
          },
        },
        pengujiUjians: {
          include: {
            dosen: {
              include: { user: true },
            },
          },
          orderBy: { peran: "asc" },
        },
        keputusan: true,
      },
    });

    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");

    const date = ujian.jadwalUjian || new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const pengujiList = ujian.pengujiUjians.map((p) => ({
      name: p.dosen.user.nama,
      role: this.formatPeran(p.peran),
      signatureUrl: p.dosen.urlTtd,
    }));

    const ketua = ujian.pengujiUjians.find((p) => p.peran === "ketua_penguji");
    const sekretaris = ujian.pengujiUjians.find(
      (p) => p.peran === "sekretaris_penguji",
    );

    const pdfData = {
      studentName: ujian.pendaftaranUjian.mahasiswa.user.nama,
      studentNim: ujian.pendaftaranUjian.mahasiswa.nim,
      prodiName: ujian.pendaftaranUjian.mahasiswa.prodi.namaProdi,
      judul: ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian,
      jenisUjian: ujian.pendaftaranUjian.jenisUjian.namaJenis,
      hari: days[date.getDay()],
      tanggal: date.getDate(),
      bulan: months[date.getMonth()],
      tahun: date.getFullYear(),
      pengujiList,
      keputusan: ujian.hasil,
      tempat: "Palembang",
      tanggalDitetapkan: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
      ketuaPenguji: ketua
        ? { name: ketua.dosen.user.nama, signatureUrl: ketua.dosen.urlTtd }
        : null,
      sekretarisPenguji: sekretaris
        ? {
            name: sekretaris.dosen.user.nama,
            signatureUrl: sekretaris.dosen.urlTtd,
          }
        : null,
    };

    return await pdfService.generateBulkPdf({
      beritaAcara: pdfData,
      daftarHadir: pdfData, // Reuse for now, will refine
      rekapitulasi: pdfData,
      nilaiIndividual: [pdfData],
      perbaikan: pdfData,
    });
  }

  async generateBulkPdf(ujianId: number) {
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: {
        pendaftaranUjian: {
          include: {
            mahasiswa: {
              include: {
                user: true,
                prodi: { include: { fakultas: true } },
                pembimbing1Rel: { include: { user: true } },
                pembimbing2Rel: { include: { user: true } },
              },
            },
            jenisUjian: true,
            rancanganPenelitian: true,
          },
        },
        pengujiUjians: { include: { dosen: { include: { user: true } } } },
        penilaians: {
          include: {
            dosen: { include: { user: true } },
            komponenPenilaian: true,
          },
        },
        keputusan: true,
      },
    });

    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");

    const prodiId = ujian.pendaftaranUjian.mahasiswa.prodiId;
    const kaprodi = await prisma.dosen.findFirst({
      where: { prodiId, jabatan: { contains: "kaprodi", mode: "insensitive" } },
      include: { user: true },
    });

    const date = ujian.jadwalUjian || new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const ketua = ujian.pengujiUjians.find((p) => p.peran === "ketua_penguji");
    const sekretaris = ujian.pengujiUjians.find(
      (p) => p.peran === "sekretaris_penguji",
    );

    const commonData = {
      studentName: ujian.pendaftaranUjian.mahasiswa.user.nama,
      studentNim: ujian.pendaftaranUjian.mahasiswa.nim,
      prodiName:
        ujian.pendaftaranUjian.mahasiswa.prodi?.namaProdi || "SISTEM INFORMASI",
      judul: ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian || "-",
      jenisUjian: ujian.pendaftaranUjian.jenisUjian.namaJenis,
      hari: days[date.getDay()],
      tanggal: date.getDate(),
      bulan: months[date.getMonth()],
      tahun: date.getFullYear(),
      kaprodi: {
        name: kaprodi?.user.nama || ".........................",
        nip: kaprodi?.nip || ".........................",
      },
    };

    const beritaAcaraData = {
      ...commonData,
      pengujiList: ujian.pengujiUjians.map((p) => ({
        name: p.dosen.user.nama,
        role: this.formatPeran(p.peran),
        signatureUrl: p.dosen.urlTtd,
      })),
      keputusan: ujian.hasil,
      tempat: "Palembang",
      tanggalDitetapkan: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
      ketuaPenguji: ketua
        ? { name: ketua.dosen.user.nama, signatureUrl: ketua.dosen.urlTtd }
        : null,
      sekretarisPenguji: sekretaris
        ? {
            name: sekretaris.dosen.user.nama,
            signatureUrl: sekretaris.dosen.urlTtd,
          }
        : null,
      catatanRevisi: ujian.catatanRevisi,
    };

    const daftarHadirData = {
      ...commonData,
      pengujiList: ujian.pengujiUjians.map((p) => ({
        name: p.dosen.user.nama,
        nip: p.dosen.nip,
        role: this.formatPeran(p.peran),
        signatureUrl: p.dosen.urlTtd,
      })),
    };

    const rekapitulasiData = {
      ...commonData,
      pengujiList: ujian.pengujiUjians.map((p) => {
        // Simple average for now as calculation logic is complex
        const pns = ujian.penilaians.filter((pn) => pn.dosenId === p.dosenId);
        const avg =
          pns.length > 0
            ? (
                pns.reduce((a, b) => a + Number(b.nilai || 0), 0) / pns.length
              ).toFixed(2)
            : "-";
        return {
          name: p.dosen.user.nama,
          role: this.formatPeran(p.peran),
          nilai: avg,
        };
      }),
      totalAngka: ujian.nilaiAkhir?.toFixed(2) || "-",
      rataRata: ujian.nilaiAkhir?.toFixed(2) || "-",
      nilaiHuruf: ujian.nilaiHuruf || "-",
    };

    const formCodes = ["06", "07", "08", "09"];
    const nilaiIndividual = ujian.pengujiUjians.map((p, idx) => {
      const pns = ujian.penilaians.filter((pn) => pn.dosenId === p.dosenId);
      return {
        formCode: "FST. FORM SKRIPSI " + (formCodes[idx] || "06"),
        role: this.formatPeran(p.peran),
        jenisUjian: commonData.jenisUjian,
        studentName: commonData.studentName,
        studentNim: commonData.studentNim,
        prodiName: commonData.prodiName,
        pengujiName: p.dosen.user.nama,
        pengujiSignatureUrl: p.dosen.urlTtd,
        penilaians: pns.map((pn) => ({
          kriteria: pn.komponenPenilaian.kriteria,
          indikator: pn.komponenPenilaian.indikatorPenilaian || "-",
          bobot: "25", // Mock or fetch from somewhere
          skor: Number(pn.nilai || 0).toFixed(2),
          bobotSkor: Number(pn.nilai || 0).toFixed(2),
        })),
        totalSkor: (
          pns.reduce((a, b) => a + Number(b.nilai || 0), 0) / (pns.length || 1)
        ).toFixed(2),
      };
    });

    const perbaikanData = {
      ...commonData,
      pembimbing1:
        ujian.pendaftaranUjian.mahasiswa.pembimbing1Rel?.user.nama || "-",
      pembimbing2:
        ujian.pendaftaranUjian.mahasiswa.pembimbing2Rel?.user.nama || "-",
      tanggalSeminar: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
      ketuaPenguji: { name: ketua?.dosen.user.nama },
      sekretarisPenguji: { name: sekretaris?.dosen.user.nama },
    };

    return await pdfService.generateBulkPdf({
      beritaAcara: beritaAcaraData,
      daftarHadir: daftarHadirData,
      rekapitulasi: rekapitulasiData,
      nilaiIndividual,
      perbaikan: perbaikanData,
    });
  }

  async generateJadwalUjianPdf() {
    const ujianList = await prisma.ujian.findMany({
      where: {
        status: { in: ["dijadwalkan", "selesai"] },
        jadwalUjian: { not: null },
      },
      include: {
        pendaftaranUjian: {
          include: {
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
            rancanganPenelitian: true,
          },
        },
        ruangan: true,
        pengujiUjians: {
          include: { dosen: { include: { user: true } } },
        },
      },
      orderBy: [
        { pendaftaranUjian: { jenisUjianId: "asc" } },
        { jadwalUjian: "asc" },
        { waktuMulai: "asc" },
      ],
    });

    // Group by Jenis Ujian
    const grouped: any = {};
    for (const u of ujianList) {
      const jenisNama =
        u.pendaftaranUjian?.jenisUjian?.namaJenis?.toUpperCase() || "LAINNYA";
      if (!grouped[jenisNama]) {
        grouped[jenisNama] = [];
      }

      const getPenguji = (peran: string) => {
        const p = u.pengujiUjians.find((px: any) => px.peran === peran);
        return p?.dosen?.user?.nama || "-";
      };

      grouped[jenisNama].push({
        nim: u.pendaftaranUjian?.mahasiswa?.nim || "-",
        nama: u.pendaftaranUjian?.mahasiswa?.user?.nama || "-",
        hari: u.hariUjian || "-",
        tanggal: u.jadwalUjian
          ? u.jadwalUjian.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })
          : "-",
        waktu: u.waktuMulai
          ? `${u.waktuMulai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} s.d ${u.waktuSelesai ? u.waktuSelesai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "?"}`
          : "-",
        ruang: u.ruangan?.namaRuangan || "-",
        ruangDetail: u.ruangan?.deskripsi || "-",
        judul: u.pendaftaranUjian?.rancanganPenelitian?.judulPenelitian || "-",
        pengujiKetua: getPenguji("ketua_penguji"),
        pengujiSekretaris: getPenguji("sekretaris_penguji"),
        penguji1: getPenguji("penguji_1"),
        penguji2: getPenguji("penguji_2"),
      });
    }

    const sections = Object.keys(grouped).map((title) => ({
      title: `UJIAN ${title}`,
      items: grouped[title],
    }));

    return await pdfService.generateJadwalUjianPdf({ sections });
  }

  private formatPeran(peran: string) {
    switch (peran) {
      case "ketua_penguji":
        return "Ketua Penguji";
      case "sekretaris_penguji":
        return "Sekretaris Penguji";
      case "penguji_1":
        return "Penguji I";
      case "penguji_2":
        return "Penguji II";
      default:
        return peran;
    }
  }
}

export const ujianService = new UjianService();
