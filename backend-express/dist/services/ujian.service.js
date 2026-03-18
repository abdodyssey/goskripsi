"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ujianService = exports.UjianService = void 0;
const prisma_1 = require("../utils/prisma");
const http_error_1 = require("../utils/http-error");
const pdf_service_1 = require("./pdf.service");
class UjianService {
    async getAll() {
        return await prisma_1.prisma.ujian.findMany({
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
    async getById(id) {
        return await prisma_1.prisma.ujian.findUnique({
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
    async getByMahasiswa(mahasiswaId, namaJenis) {
        return await prisma_1.prisma.ujian.findMany({
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
    async store(payload) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            let ruanganId = null;
            if (payload.ruangan_id)
                ruanganId = Number(payload.ruangan_id);
            let keputusanId = null;
            if (payload.keputusan_id)
                keputusanId = Number(payload.keputusan_id);
            const ujian = await tx.ujian.create({
                data: {
                    pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
                    hariUjian: payload.hari_ujian,
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
                const syncData = payload.penguji.map((p) => ({
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
    async update(id, payload) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const ujian = await tx.ujian.findUnique({ where: { id: Number(id) } });
            if (!ujian)
                throw new Error("Ujian tidak ditemukan");
            const dataUpdate = { ...payload };
            delete dataUpdate.penguji; // hapus relasional input arraynya
            delete dataUpdate.mahasiswaId;
            delete dataUpdate.jenisUjianId;
            if (payload.ruangan_id)
                dataUpdate.ruanganId = Number(payload.ruangan_id);
            if (payload.keputusan_id)
                dataUpdate.keputusanId = Number(payload.keputusan_id);
            if (payload.hari_ujian)
                dataUpdate.hariUjian = payload.hari_ujian;
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
            if (payload.jadwal_ujian &&
                payload.jadwal_ujian !== ujian.jadwalUjian?.toISOString()) {
                await tx.ujian.update({
                    where: { id: ujian.id },
                    data: { status: "dijadwalkan" },
                });
            }
            if (payload.penguji) {
                // Sync operation: hapus dan insert
                await tx.pengujiUjian.deleteMany({ where: { ujianId: Number(id) } });
                const syncData = payload.penguji.map((p) => ({
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
    async delete(id) {
        return await prisma_1.prisma.ujian.delete({ where: { id: Number(id) } });
    }
    // Pure logic pemindahan dari model Ujian.php Laravel -> hitungNilaiAkhir()
    async hitungNilaiAkhir(ujianId, txIn) {
        const callback = async (tx) => {
            const ujian = await tx.ujian.findUnique({
                where: { id: ujianId },
                include: {
                    pendaftaranUjian: { include: { jenisUjian: true } },
                    pengujiUjians: { where: { hadir: true } },
                },
            });
            if (!ujian || !ujian.pendaftaranUjian?.jenisUjian)
                return null;
            const presentDosenIds = ujian.pengujiUjians.map((px) => px.dosenId);
            if (presentDosenIds.length === 0)
                return null;
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
            if (penilaian.length === 0)
                return null;
            const pengujiRolesMap = new Map();
            ujian.pengujiUjians.forEach((p) => pengujiRolesMap.set(p.dosenId, p.peran));
            let sumNilaiBobot = 0;
            let sumBobot = 0;
            for (const p of penilaian) {
                const peran = pengujiRolesMap.get(p.dosenId);
                const bobotData = p.komponenPenilaian.bobotKomponenPerans.find((b) => b.peran === peran);
                const bobot = bobotData?.bobot || 0;
                const nilai = Number(p.nilai) || 0;
                sumNilaiBobot += nilai * bobot;
                sumBobot += bobot;
            }
            if (sumBobot === 0)
                return null;
            const nilaiAkhir = sumNilaiBobot / sumBobot;
            // Convert to Letter Grade
            let nilaiHuruf = "E";
            if (nilaiAkhir >= 80)
                nilaiHuruf = "A";
            else if (nilaiAkhir >= 70)
                nilaiHuruf = "B";
            else if (nilaiAkhir >= 60)
                nilaiHuruf = "C";
            else if (nilaiAkhir >= 56)
                nilaiHuruf = "D";
            // Ketentuan: Lulus jika minimal C (nilai akhir >= 60)
            const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);
            // Aturan Tambahan: Jika ada salah satu nilai < 60, maka TIDAK LULUS
            // Berlaku untuk: Seminar Proposal, Ujian Hasil, Ujian Skripsi
            const namaJenis = ujian.pendaftaranUjian.jenisUjian.namaJenis?.toLowerCase() ?? "";
            const targetExams = ["proposal", "hasil", "skripsi"];
            const isTargetExam = targetExams.some((t) => namaJenis.includes(t));
            const hasLowScore = isTargetExam &&
                penilaian.some((p) => {
                    // Only check components that have weight for this examiner role
                    const peran = pengujiRolesMap.get(p.dosenId);
                    const bobot = p.komponenPenilaian.bobotKomponenPerans.find((b) => b.peran === peran)?.bobot || 0;
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
        return txIn ? callback(txIn) : prisma_1.prisma.$transaction(callback);
    }
    // --- New Exam Execution Methods ---
    async submitAbsensi(userId, ujianId, absensiList) {
        const penguji = await prisma_1.prisma.pengujiUjian.findFirst({
            where: { ujianId, dosenId: userId, peran: "ketua_penguji" },
        });
        if (!penguji)
            throw new http_error_1.HttpError(403, "Hanya ketua penguji yang bisa input absensi");
        const ujian = await prisma_1.prisma.ujian.findUnique({
            where: { id: ujianId },
            include: { pengujiUjians: true },
        });
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        if (ujian.status !== "dijadwalkan")
            throw new http_error_1.HttpError(400, "Absensi hanya bisa disubmit saat status ujian 'dijadwalkan'");
        const alreadySubmitted = ujian.pengujiUjians.some((p) => p.tanggalAbsen);
        if (alreadySubmitted)
            throw new http_error_1.HttpError(400, "Absensi sudah pernah disubmit sebelumnya");
        return await prisma_1.prisma.$transaction(async (tx) => {
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
    async getFormInputNilai(userId, ujianId) {
        const penguji = await prisma_1.prisma.pengujiUjian.findFirst({
            where: { ujianId, dosenId: userId },
        });
        if (!penguji)
            throw new http_error_1.HttpError(403, "Anda tidak terdaftar sebagai penguji");
        const ujian = await prisma_1.prisma.ujian.findUnique({
            where: { id: ujianId },
            include: {
                pendaftaranUjian: { include: { jenisUjian: true } },
                pengujiUjians: true,
            },
        });
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        const components = await prisma_1.prisma.komponenPenilaian.findMany({
            where: {
                jenisUjianId: ujian.pendaftaranUjian.jenisUjianId,
                bobotKomponenPerans: { some: { peran: penguji.peran } },
            },
            include: {
                bobotKomponenPerans: { where: { peran: penguji.peran } },
                penilaians: { where: { ujianId, dosenId: userId } },
            },
        });
        const allScores = await prisma_1.prisma.penilaian.findMany({
            where: { ujianId },
            include: {
                dosen: { include: { user: true } },
                komponenPenilaian: {
                    include: { bobotKomponenPerans: true },
                },
            },
        });
        const sudahSubmit = components.length > 0 &&
            components.every((c) => c.penilaians[0]?.sudahSubmit);
        return {
            penguji,
            components,
            allScores,
            ujian,
            sudahSubmit,
        };
    }
    async simpanDraftNilai(userId, ujianId, penilaianList) {
        return await this._upsertPenilaian(userId, ujianId, penilaianList, false);
    }
    async submitNilaiFinal(userId, ujianId, penilaianList) {
        return await this._upsertPenilaian(userId, ujianId, penilaianList, true);
    }
    async _upsertPenilaian(userId, ujianId, penilaianList, isFinal) {
        const me = await prisma_1.prisma.pengujiUjian.findFirst({
            where: { ujianId, dosenId: userId },
        });
        if (!me)
            throw new http_error_1.HttpError(403, "Hanya penguji yang terdaftar yang bisa mengakses halaman ini");
        const isKetua = me.peran === "ketua_penguji";
        const ujian = await prisma_1.prisma.ujian.findUnique({ where: { id: ujianId } });
        if (ujian?.nilaiDifinalisasi)
            throw new http_error_1.HttpError(400, "Nilai sudah difinalisasi");
        return await prisma_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            for (const p of penilaianList) {
                if (p.nilai < 0 || p.nilai > 100)
                    throw new http_error_1.HttpError(400, "Nilai valid 0-100");
                // Target dosenId is either specified (if requester is ketua) or self
                const targetDosenId = p.dosenId && p.dosenId !== userId && isKetua ? p.dosenId : userId;
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
    async finalisasiNilai(userId, ujianId) {
        const ketua = await prisma_1.prisma.pengujiUjian.findFirst({
            where: { ujianId, dosenId: userId, peran: "ketua_penguji" },
        });
        if (!ketua)
            throw new http_error_1.HttpError(403, "Hanya ketua penguji yang bisa finalisasi");
        const ujian = await prisma_1.prisma.ujian.findUnique({
            where: { id: ujianId },
            include: {
                pendaftaranUjian: { include: { jenisUjian: true } },
                pengujiUjians: { where: { hadir: true } },
            },
        });
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        if (ujian.nilaiDifinalisasi)
            throw new http_error_1.HttpError(400, "Nilai sudah difinalisasi");
        const presentDosenIds = ujian.pengujiUjians.map((p) => p.dosenId);
        if (presentDosenIds.length === 0)
            throw new http_error_1.HttpError(400, "Tidak ada penguji yang hadir");
        const penilaians = await prisma_1.prisma.penilaian.findMany({
            where: { ujianId, dosenId: { in: presentDosenIds } },
            include: {
                komponenPenilaian: { include: { bobotKomponenPerans: true } },
            },
        });
        const rolesMap = new Map();
        ujian.pengujiUjians.forEach((p) => rolesMap.set(p.dosenId, p.peran));
        let sumNilaiBobot = 0;
        let sumBobot = 0;
        let anyScoreUnder60 = false;
        for (const p of penilaians) {
            const peran = rolesMap.get(p.dosenId);
            const bobotData = p.komponenPenilaian.bobotKomponenPerans.find((b) => b.peran === peran);
            const bobot = bobotData?.bobot || 0;
            const nilai = Number(p.nilai) || 0;
            if (bobot > 0 && nilai < 60) {
                anyScoreUnder60 = true;
            }
            sumNilaiBobot += nilai * bobot;
            sumBobot += bobot;
        }
        if (sumBobot === 0)
            throw new http_error_1.HttpError(400, "Tidak dapat menghitung, bobot 0");
        const nilaiAkhir = sumNilaiBobot / sumBobot;
        let nilaiHuruf = "E";
        if (nilaiAkhir >= 80)
            nilaiHuruf = "A";
        else if (nilaiAkhir >= 70)
            nilaiHuruf = "B";
        else if (nilaiAkhir >= 60)
            nilaiHuruf = "C";
        else if (nilaiAkhir >= 56)
            nilaiHuruf = "D";
        // Ketentuan: Lulus jika minimal C (nilai akhir >= 60)
        const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);
        // Aturan Tambahan: Jika ada salah satu nilai < 60, maka TIDAK LULUS
        // Berlaku untuk: Seminar Proposal, Ujian Hasil, Ujian Skripsi
        const namaJenisFinalisasi = ujian.pendaftaranUjian?.jenisUjian?.namaJenis?.toLowerCase() ?? "";
        const targetExamsFinalisasi = ["proposal", "hasil", "skripsi"];
        const isTargetExamFinalisasi = targetExamsFinalisasi.some((t) => namaJenisFinalisasi.includes(t));
        const hasilFinal = lulusByGrade && !(isTargetExamFinalisasi && anyScoreUnder60)
            ? "lulus"
            : "tidak_lulus";
        return await prisma_1.prisma.ujian.update({
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
    async getDataKeputusan(ujianId) {
        const ujian = await prisma_1.prisma.ujian.findUnique({
            where: { id: ujianId },
            include: { pendaftaranUjian: true },
        });
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        return await prisma_1.prisma.keputusan.findMany({
            where: {
                OR: [
                    { jenisUjianId: ujian.pendaftaranUjian.jenisUjianId },
                    { jenisUjianId: null },
                ],
                aktif: true,
            },
        });
    }
    async submitKeputusan(userId, ujianId, payload) {
        const ujian = await prisma_1.prisma.ujian.findUnique({
            where: { id: ujianId },
            include: { pengujiUjians: true },
        });
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        if (!ujian.nilaiDifinalisasi)
            throw new http_error_1.HttpError(400, "Nilai harus difinalisasi");
        const sekretaris = ujian.pengujiUjians.find((p) => p.peran === "sekretaris_penguji");
        const isSekHadir = sekretaris?.hadir || false;
        let allowed = false;
        if (isSekHadir) {
            if (sekretaris?.dosenId === userId)
                allowed = true;
        }
        else {
            const ketua = ujian.pengujiUjians.find((p) => p.peran === "ketua_penguji");
            if (ketua?.dosenId === userId)
                allowed = true;
        }
        if (!allowed)
            throw new http_error_1.HttpError(403, "Anda tidak memiliki hak input keputusan");
        return await prisma_1.prisma.ujian.update({
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
    async getSchedulingFormData(pendaftaranId) {
        const pendaftaran = await prisma_1.prisma.pendaftaranUjian.findUnique({
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
            throw new http_error_1.HttpError(404, "Data pendaftaran tidak ditemukan");
        if (pendaftaran.status !== "diterima") {
            throw new http_error_1.HttpError(400, "Pendaftaran harus berstatus 'diterima' sebelum dijadwalkan");
        }
        const lecturers = await prisma_1.prisma.dosen.findMany({
            where: { prodiId: pendaftaran.mahasiswa.prodiId, status: "aktif" },
            include: { user: true },
        });
        const rooms = await prisma_1.prisma.ruangan.findMany({
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
    async createScheduling(payload) {
        console.log("[createScheduling] Received payload:", payload);
        const { pendaftaranUjianId, jadwalUjian, waktuMulai, waktuSelesai, hariUjian, ruanganId, pengujiList, } = payload;
        // Basic Validation
        if (new Date(waktuSelesai) <= new Date(waktuMulai)) {
            throw new http_error_1.HttpError(400, "Waktu selesai harus lebih besar dari waktu mulai");
        }
        // Role validation
        const roles = pengujiList.map((p) => p.peran);
        const uniqueRoles = new Set(roles);
        if (uniqueRoles.size !== 4 || roles.length !== 4) {
            throw new http_error_1.HttpError(400, "Ke-4 peran penguji harus terisi lengkap dan tidak boleh duplikat");
        }
        // Single dose per roles
        const dosenIds = pengujiList.map((p) => p.dosenId);
        if (new Set(dosenIds).size !== 4) {
            throw new http_error_1.HttpError(400, "Satu dosen tidak boleh memegang lebih dari satu peran");
        }
        try {
            return await prisma_1.prisma.$transaction(async (tx) => {
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
                for (const p of pengujiList) {
                    await tx.pengujiUjian.create({
                        data: {
                            ujianId: ujian.id,
                            dosenId: Number(p.dosenId),
                            peran: p.peran,
                        },
                    });
                }
                // Mock notification
                console.log(`Notification sent to students and examiners for exam ID: ${ujian.id}`);
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
        }
        catch (error) {
            console.error("[createScheduling] Error during transaction:", error);
            throw error;
        }
    }
    async updateScheduling(ujianId, payload) {
        console.log("[updateScheduling] Received payload:", payload);
        const { jadwalUjian, waktuMulai, waktuSelesai, hariUjian, ruanganId, pengujiList, } = payload;
        if (new Date(waktuSelesai) <= new Date(waktuMulai)) {
            throw new http_error_1.HttpError(400, "Waktu selesai harus lebih besar dari waktu mulai");
        }
        try {
            return await prisma_1.prisma.$transaction(async (tx) => {
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
                    for (const p of pengujiList) {
                        await tx.pengujiUjian.create({
                            data: {
                                ujianId: ujian.id,
                                dosenId: Number(p.dosenId),
                                peran: p.peran,
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
        }
        catch (error) {
            console.error("[updateScheduling] Error during transaction:", error);
            throw error;
        }
    }
    async generateBeritaAcaraPdf(id) {
        const ujian = await prisma_1.prisma.ujian.findUnique({
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
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
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
        const sekretaris = ujian.pengujiUjians.find((p) => p.peran === "sekretaris_penguji");
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
        return await pdf_service_1.pdfService.generateBulkPdf({
            beritaAcara: pdfData,
            daftarHadir: pdfData, // Reuse for now, will refine
            rekapitulasi: pdfData,
            nilaiIndividual: [pdfData],
            perbaikan: pdfData,
        });
    }
    async generateBulkPdf(ujianId) {
        const ujian = await prisma_1.prisma.ujian.findUnique({
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
        if (!ujian)
            throw new http_error_1.HttpError(404, "Ujian tidak ditemukan");
        const prodiId = ujian.pendaftaranUjian.mahasiswa.prodiId;
        const kaprodi = await prisma_1.prisma.dosen.findFirst({
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
        const sekretaris = ujian.pengujiUjians.find((p) => p.peran === "sekretaris_penguji");
        const commonData = {
            studentName: ujian.pendaftaranUjian.mahasiswa.user.nama,
            studentNim: ujian.pendaftaranUjian.mahasiswa.nim,
            prodiName: ujian.pendaftaranUjian.mahasiswa.prodi?.namaProdi || "SISTEM INFORMASI",
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
                const avg = pns.length > 0
                    ? (pns.reduce((a, b) => a + Number(b.nilai || 0), 0) / pns.length).toFixed(2)
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
                totalSkor: (pns.reduce((a, b) => a + Number(b.nilai || 0), 0) / (pns.length || 1)).toFixed(2),
            };
        });
        const perbaikanData = {
            ...commonData,
            pembimbing1: ujian.pendaftaranUjian.mahasiswa.pembimbing1Rel?.user.nama || "-",
            pembimbing2: ujian.pendaftaranUjian.mahasiswa.pembimbing2Rel?.user.nama || "-",
            tanggalSeminar: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
            ketuaPenguji: { name: ketua?.dosen.user.nama },
            sekretarisPenguji: { name: sekretaris?.dosen.user.nama },
        };
        return await pdf_service_1.pdfService.generateBulkPdf({
            beritaAcara: beritaAcaraData,
            daftarHadir: daftarHadirData,
            rekapitulasi: rekapitulasiData,
            nilaiIndividual,
            perbaikan: perbaikanData,
        });
    }
    async generateJadwalUjianPdf() {
        const ujianList = await prisma_1.prisma.ujian.findMany({
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
        const grouped = {};
        for (const u of ujianList) {
            const jenisNama = u.pendaftaranUjian?.jenisUjian?.namaJenis?.toUpperCase() || "LAINNYA";
            if (!grouped[jenisNama]) {
                grouped[jenisNama] = [];
            }
            const getPenguji = (peran) => {
                const p = u.pengujiUjians.find((px) => px.peran === peran);
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
        return await pdf_service_1.pdfService.generateJadwalUjianPdf({ sections });
    }
    formatPeran(peran) {
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
exports.UjianService = UjianService;
exports.ujianService = new UjianService();
