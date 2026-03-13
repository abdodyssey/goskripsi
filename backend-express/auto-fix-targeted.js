const fs = require("fs");
const path = require("path");

const fixes = {
  "fakultas.service.ts": [
    {
      from: "nama_fakultas: payload.namaFakultas,",
      to: "namaFakultas: payload.nama_fakultas,",
    },
    {
      from: "dataUpdate.nama_fakultas = payload.nama_fakultas;",
      to: "dataUpdate.namaFakultas = payload.nama_fakultas;",
    },
  ],
  "jenis-ujian.service.ts": [
    {
      from: "nama_jenis: payload.namaJenis,",
      to: "namaJenis: payload.nama_jenis,",
    },
    {
      from: "dataUpdate.nama_jenis = payload.nama_jenis;",
      to: "dataUpdate.namaJenis = payload.nama_jenis;",
    },
  ],
  "komponen-penilaian.service.ts": [
    {
      from: "jenis_ujian_id: payload.jenisUjianId,",
      to: "jenisUjianId: payload.jenis_ujian_id,",
    },
    {
      from: "dataUpdate.jenis_ujian_id = payload.jenis_ujian_id;",
      to: "dataUpdate.jenisUjianId = payload.jenis_ujian_id;",
    },
  ],
  "pemenuhan-syarat.service.ts": [
    {
      from: "pendaftaran_ujian_id: payload.pendaftaranUjianId,",
      to: "pendaftaranUjianId: payload.pendaftaran_ujian_id,",
    },
    {
      from: "syarat_id: payload.syaratId,",
      to: "syaratId: payload.syarat_id,",
    },
    {
      from: "dataUpdate.pendaftaran_ujian_id = payload.pendaftaran_ujian_id;",
      to: "dataUpdate.pendaftaranUjianId = payload.pendaftaran_ujian_id;",
    },
    {
      from: "dataUpdate.syarat_id = payload.syarat_id;",
      to: "dataUpdate.syaratId = payload.syarat_id;",
    },
  ],
  "peminatan.service.ts": [
    {
      from: "nama_peminatan: payload.namaPeminatan,",
      to: "namaPeminatan: payload.nama_peminatan,",
    },
    { from: "prodi_id: payload.prodiId,", to: "prodiId: payload.prodi_id," },
    {
      from: "dataUpdate.nama_peminatan = payload.nama_peminatan;",
      to: "dataUpdate.namaPeminatan = payload.nama_peminatan;",
    },
    {
      from: "dataUpdate.prodi_id = payload.prodi_id;",
      to: "dataUpdate.prodiId = payload.prodi_id;",
    },
  ],
  "prodi.service.ts": [
    {
      from: "nama_prodi: payload.namaProdi,",
      to: "namaProdi: payload.nama_prodi,",
    },
    {
      from: "dataUpdate.nama_prodi = payload.nama_prodi;",
      to: "dataUpdate.namaProdi = payload.nama_prodi;",
    },
  ],
  "ruangan.service.ts": [
    {
      from: "nama_ruangan: payload.namaRuangan,",
      to: "namaRuangan: payload.nama_ruangan,",
    },
    { from: "prodi_id: payload.prodiId,", to: "prodiId: payload.prodi_id," },
    {
      from: "dataUpdate.nama_ruangan = payload.nama_ruangan;",
      to: "dataUpdate.namaRuangan = payload.nama_ruangan;",
    },
    {
      from: "dataUpdate.prodi_id = payload.prodi_id;",
      to: "dataUpdate.prodiId = payload.prodi_id;",
    },
  ],
  "syarat.service.ts": [
    {
      from: "jenis_ujian_id: payload.jenisUjianId,",
      to: "jenisUjianId: payload.jenis_ujian_id,",
    },
    {
      from: "nama_syarat: payload.namaSyarat,",
      to: "namaSyarat: payload.nama_syarat,",
    },
    {
      from: "dataUpdate.jenis_ujian_id = payload.jenis_ujian_id;",
      to: "dataUpdate.jenisUjianId = payload.jenis_ujian_id;",
    },
    {
      from: "dataUpdate.nama_syarat = payload.nama_syarat;",
      to: "dataUpdate.namaSyarat = payload.nama_syarat;",
    },
  ],
  "dosen.service.ts": [
    { from: "no_hp: data.noHp,", to: "noHp: data.no_hp," },
    { from: "prodi_id: data.prodiId,", to: "prodiId: data.prodi_id," },
    {
      from: "dataUpdate.prodi_id = data.prodi_id;",
      to: "dataUpdate.prodiId = data.prodi_id;",
    },
  ],
  "mahasiswa.service.ts": [
    { from: "no_hp: data.noHp,", to: "noHp: data.no_hp," },
    { from: "prodi_id: data.prodiId,", to: "prodiId: data.prodi_id," },
    {
      from: "peminatan_id: data.peminatanId,",
      to: "peminatanId: data.peminatan_id,",
    },
    {
      from: "dataUpdate.prodi_id = data.prodi_id;",
      to: "dataUpdate.prodiId = data.prodi_id;",
    },
    {
      from: "dataUpdate.peminatan_id = data.peminatan_id;",
      to: "dataUpdate.peminatanId = data.peminatan_id;",
    },
  ],
  "pendaftaran-ujian.service.ts": [
    {
      from: "mahasiswa_id: payload.mahasiswaId,",
      to: "mahasiswaId: payload.mahasiswa_id,",
    },
    {
      from: "jenis_ujian_id: payload.jenisUjianId,",
      to: "jenisUjianId: payload.jenis_ujian_id,",
    },
  ],
  "ranpel.service.ts": [
    {
      from: "masalah_dan_penyebab: payload.masalahDanPenyebab,",
      to: "masalahDanPenyebab: payload.masalah_dan_penyebab,",
    },
    {
      from: "metode_penelitian: payload.metodePenelitian,",
      to: "metodePenelitian: payload.metode_penelitian,",
    },
  ],
  "ujian.service.ts": [
    {
      from: "pendaftaran_ujian_id: payload.pendaftaranUjianId,",
      to: "pendaftaranUjianId: payload.pendaftaran_ujian_id,",
    },
    {
      from: "hari_ujian: payload.hariUjian,",
      to: "hariUjian: payload.hari_ujian,",
    },
    {
      from: "jadwal_ujian: new Date(payload.jadwalUjian),",
      to: "jadwalUjian: new Date(payload.jadwal_ujian),",
    },
    {
      from: "waktu_mulai: new Date(`1970-01-01T${payload.waktuMulai}:00Z`),",
      to: "waktuMulai: new Date(`1970-01-01T${payload.waktu_mulai}:00Z`),",
    },
    {
      from: "waktu_selesai: new Date(`1970-01-01T${payload.waktuSelesai}:00Z`),",
      to: "waktuSelesai: new Date(`1970-01-01T${payload.waktu_selesai}:00Z`),",
    },
  ],
};

for (const [filename, changes] of Object.entries(fixes)) {
  const p = path.join(
    "/home/devtective/goskripsi/backend-express/src/services",
    filename,
  );
  if (!fs.existsSync(p)) continue;

  let content = fs.readFileSync(p, "utf8");
  for (const { from, to } of changes) {
    // Find and replace. We use split/join for global replace without complex regex matching.
    content = content.split(from).join(to);
  }
  fs.writeFileSync(p, content);
  console.log(`Replaced in ${filename}`);
}
