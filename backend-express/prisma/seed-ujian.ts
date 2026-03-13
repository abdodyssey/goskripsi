import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding jenis_ujian & syarat...");

  // Upsert 3 jenis ujian
  const seminarProposal = await prisma.jenis_ujian.upsert({
    where: { id: 1n },
    update: { nama_jenis: "Seminar Proposal" },
    create: {
      id: 1n,
      nama_jenis: "Seminar Proposal",
      deskripsi: "Ujian seminar proposal skripsi",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const ujianHasil = await prisma.jenis_ujian.upsert({
    where: { id: 2n },
    update: { nama_jenis: "Ujian Hasil" },
    create: {
      id: 2n,
      nama_jenis: "Ujian Hasil",
      deskripsi: "Ujian hasil penelitian skripsi",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const ujianSkripsi = await prisma.jenis_ujian.upsert({
    where: { id: 3n },
    update: { nama_jenis: "Ujian Skripsi" },
    create: {
      id: 3n,
      nama_jenis: "Ujian Skripsi",
      deskripsi: "Ujian akhir skripsi (munaqasyah)",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log("✅ Jenis Ujian:", {
    seminarProposal: seminarProposal.id.toString(),
    ujianHasil: ujianHasil.id.toString(),
    ujianSkripsi: ujianSkripsi.id.toString(),
  });

  // Delete existing syarat to avoid duplicates
  await prisma.syarat.deleteMany({
    where: {
      jenis_ujian_id: { in: [1n, 2n, 3n] },
    },
  });

  // Syarat Seminar Proposal (jenis_ujian_id = 1)
  const syaratSeminarProposal = [
    {
      nama_syarat: "Lulus mata kuliah Metodologi Penelitian (minimal C)",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "SKS yang telah ditempuh minimal >= 100 sks",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "IPK >= 2.00",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Transkrip nilai sementara yang dilegalisir",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "Formulir pengajuan judul dan pembimbing skripsi yang telah ditanda tangani Koordinator Skripsi dan Ketua Program Studi",
      kategori: "bimbingan" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "Halaman pengesahan proposal skripsi yang di tanda tangani Pembimbing dan Ketua Program Studi",
      kategori: "bimbingan" as const,
      wajib: true,
    },
    {
      nama_syarat: "Formulir Mengikuti Ujian Seminar Proposal",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Cek Plagiat",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "File Proposal Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Proposal",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Form Perbaikan Proposal untuk ujian ke-2, 3 dst.",
      kategori: "administratif" as const,
      wajib: false,
    },
  ];

  // Syarat Ujian Hasil (jenis_ujian_id = 2)
  const syaratUjianHasil = [
    {
      nama_syarat: "Bukti pembayaran SPP semester berjalan",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "KST yang tercantum Skripsi",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Transkrip nilai sementara yang dilegalisir",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Ujian Seminar Proposal",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti lulus ujian BTA (sertifikat BTA)",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti lulus TOEFL >= 400",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti hafalan 10 surat Juz 'Amma",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Ijazah SMA/MA",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Sertifikat KKN",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti hadir dalam seminar proposal",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "Halaman Pengesahan Skripsi untuk ujian hasil yang ditanda tangani Pembimbing dan Ketua Program Studi",
      kategori: "bimbingan" as const,
      wajib: true,
    },
    {
      nama_syarat: "Formulir Mengikuti Ujian Hasil",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Cek Plagiat",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "File Hasil Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Hasil",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Formulir Perbaikan Proposal Skripsi",
      kategori: "administratif" as const,
      wajib: false,
    },
    {
      nama_syarat: "Form Perbaikan Hasil untuk ujian ke-2, 3 dst.",
      kategori: "administratif" as const,
      wajib: false,
    },
  ];

  // Syarat Ujian Skripsi (jenis_ujian_id = 3)
  const syaratUjianSkripsi = [
    {
      nama_syarat: "Skripsi yang di ACC Pembimbing I dan II",
      kategori: "bimbingan" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "Surat Kelengkapan Berkas Yang Telah Ditanda tangani oleh Ka. Prodi / Sek. Prodi",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Rekapitulasi Nilai Ujian Komprehensif",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Ket. Perubahan Judul (Jika Berubah)",
      kategori: "administratif" as const,
      wajib: false,
    },
    {
      nama_syarat: "Surat Izin Penelitian",
      kategori: "administratif" as const,
      wajib: true,
    },
    { nama_syarat: "KTM", kategori: "administratif" as const, wajib: true },
    {
      nama_syarat: "Bukti pembayaran SPP semester berjalan",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Transkrip nilai sementara yang dilegalisir",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Ujian Seminar Proposal",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti lulus ujian BTA (sertifikat BTA)",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Ijazah SMA/MA",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Sertifikat KKN",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Formulir Mengikuti Ujian Skripsi",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Ujian Hasil",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Surat Keterangan Lulus Cek Plagiat",
      kategori: "akademik" as const,
      wajib: true,
    },
    {
      nama_syarat: "Bukti mengirim (Submit) jurnal ilmiah",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Sertifikat OSPEK",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "Halaman Pengesahan Skripsi yang ditanda tangani oleh Pembimbing dan ketua Program Studi",
      kategori: "bimbingan" as const,
      wajib: true,
    },
    {
      nama_syarat:
        "File Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Skripsi",
      kategori: "administratif" as const,
      wajib: true,
    },
    {
      nama_syarat: "Formulir Perbaikan Hasil Skripsi",
      kategori: "administratif" as const,
      wajib: false,
    },
    {
      nama_syarat: "Form Perbaikan Skripsi untuk ujian ke-2, 3 dst.",
      kategori: "administratif" as const,
      wajib: false,
    },
  ];

  const now = new Date();

  const allSyarat = [
    ...syaratSeminarProposal.map((s) => ({
      ...s,
      jenis_ujian_id: 1n,
      created_at: now,
      updated_at: now,
    })),
    ...syaratUjianHasil.map((s) => ({
      ...s,
      jenis_ujian_id: 2n,
      created_at: now,
      updated_at: now,
    })),
    ...syaratUjianSkripsi.map((s) => ({
      ...s,
      jenis_ujian_id: 3n,
      created_at: now,
      updated_at: now,
    })),
  ];

  const result = await prisma.syarat.createMany({ data: allSyarat });
  console.log(`✅ Inserted ${result.count} syarat records`);

  // Verify
  const count = await prisma.syarat.groupBy({
    by: ["jenis_ujian_id"],
    _count: true,
  });
  console.log(
    "📊 Syarat per jenis ujian:",
    count.map((c) => ({
      jenis_ujian_id: c.jenis_ujian_id.toString(),
      count: c._count,
    })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
