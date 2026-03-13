const fs = require("fs");
const path = require("path");

const servicesDir = path.join(__dirname, "src", "services");

const replacements = [
  // BigInt to Number
  { pattern: /BigInt\((.*?)\)/g, replace: "Number($1)" },

  // Clean up removed timestamps
  { pattern: /updated_at:\s*new\s*Date\(\),?/g, replace: "" },
  { pattern: /created_at:\s*new\s*Date\(\),?/g, replace: "" },

  // Relation name fixes
  {
    pattern: /dosen_mahasiswa_pembimbing_1Todosen/g,
    replace: "pembimbing1Rel",
  },
  {
    pattern: /dosen_mahasiswa_pembimbing_2Todosen/g,
    replace: "pembimbing2Rel",
  },
  { pattern: /dosen_mahasiswa_dosen_paTodosen/g, replace: "dosenPaRel" },

  // Prisma types capitalization
  {
    pattern: /Prisma\.([a-z])([a-zA-Z]*)(Where|UncheckedCreate|Update)Input/g,
    replace: (match, p1, p2, p3) => `Prisma.${p1.toUpperCase()}${p2}${p3}Input`,
  },
  {
    pattern: /Prisma\.([a-z])([a-zA-Z]*)CreateInput/g,
    replace: (match, p1, p2) => `Prisma.${p1.toUpperCase()}${p2}CreateInput`,
  },

  // Snake_case keys to camelCase based on schema
  { pattern: /pendaftaran_ujian_id/g, replace: "pendaftaranUjianId" },
  { pattern: /jenis_ujian_id/g, replace: "jenisUjianId" },
  { pattern: /prodi_id/g, replace: "prodiId" },
  { pattern: /mahasiswa_id/g, replace: "mahasiswaId" },
  { pattern: /dosen_id/g, replace: "dosenId" },
  { pattern: /ujian_id/g, replace: "ujianId" },
  { pattern: /syarat_id/g, replace: "syaratId" },
  { pattern: /komponen_penilaian_id/g, replace: "komponenPenilaianId" },
  { pattern: /keputusan_id/g, replace: "keputusanId" },
  { pattern: /peminatan_id/g, replace: "peminatanId" },

  // Specific columns
  { pattern: /nama_fakultas/g, replace: "namaFakultas" },
  { pattern: /nama_prodi/g, replace: "namaProdi" },
  { pattern: /nama_peminatan/g, replace: "namaPeminatan" },
  { pattern: /nama_ruangan/g, replace: "namaRuangan" },
  { pattern: /nama_keputusan/g, replace: "namaKeputusan" },
  { pattern: /nama_jenis/g, replace: "namaJenis" },
  { pattern: /nama_syarat/g, replace: "namaSyarat" },
  { pattern: /tanggal_pendaftaran/g, replace: "tanggalPendaftaran" },
  { pattern: /tanggal_disetujui/g, replace: "tanggalDisetujui" },
  { pattern: /tanggal_pengajuan/g, replace: "tanggalPengajuan" },
  { pattern: /tanggal_review_pa/g, replace: "tanggalReviewPa" },
  { pattern: /tanggal_review_kaprodi/g, replace: "tanggalReviewKaprodi" },
  { pattern: /status_dosen_pa/g, replace: "statusDosenPa" },
  { pattern: /status_kaprodi/g, replace: "statusKaprodi" },
  { pattern: /catatan_dosen_pa/g, replace: "catatanDosenPa" },
  { pattern: /catatan_kaprodi/g, replace: "catatanKaprodi" },

  { pattern: /\.pendaftaran_ujian/g, replace: ".pendaftaranUjian" },
  { pattern: /\.jenis_ujian/g, replace: ".jenisUjian" },
  { pattern: /\.komponen_penilaian/g, replace: ".komponenPenilaian" },
  { pattern: /\.pemenuhan_syarat/g, replace: ".pemenuhanSyarat" },
  { pattern: /\.pengajuan_ranpel/g, replace: ".pengajuanRancanganPenelitian" },
  { pattern: /ranpel_id/g, replace: "rancanganPenelitianId" },
  { pattern: /ranpel/g, replace: "rancanganPenelitian" },
  { pattern: /pengajuan_ranpel/g, replace: "pengajuanRancanganPenelitian" },
  { pattern: /\.penguji_ujian/g, replace: ".pengujiUjian" },

  { pattern: /no_hp/g, replace: "noHp" },
  { pattern: /url_ttd/g, replace: "urlTtd" },
  { pattern: /nilai_akhir/g, replace: "nilaiAkhir" },
  { pattern: /nilai_huruf/g, replace: "nilaiHuruf" },
  { pattern: /hari_ujian/g, replace: "hariUjian" },
  { pattern: /jadwal_ujian/g, replace: "jadwalUjian" },
  { pattern: /waktu_mulai/g, replace: "waktuMulai" },
  { pattern: /waktu_selesai/g, replace: "waktuSelesai" },
  { pattern: /catatan_revisi/g, replace: "catatanRevisi" },

  // Mappings for older tables returning Prisma payloads
  {
    pattern: /return await prisma\.pendaftaran_ujian/g,
    replace: "return await prisma.pendaftaranUjian",
  },
  { pattern: /prisma\.jenis_ujian/g, replace: "prisma.jenisUjian" },
  { pattern: /prisma\.pemenuhan_syarat/g, replace: "prisma.pemenuhanSyarat" },
  {
    pattern: /prisma\.komponen_penilaian/g,
    replace: "prisma.komponenPenilaian",
  },
  { pattern: /prisma\.penguji_ujian/g, replace: "prisma.pengujiUjian" },
];

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += processFiles(fullPath);
    } else if (fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf8");
      replacements.forEach(({ pattern, replace }) => {
        content = content.replace(pattern, replace);
      });
      fs.writeFileSync(fullPath, content);
      count++;
    }
  }
  return count;
}

const count = processFiles(servicesDir);
console.log(`Processed ${count} files.`);
